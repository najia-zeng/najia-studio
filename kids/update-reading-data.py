#!/usr/bin/env python3
"""
阅读看板数据更新脚本
用法：python3 update-reading-data.py <new_section_json_file>

功能：
1. 读取新section的JSON数据
2. 追加到data-reading.json（只增不改不删）
3. 自动验证完整性
4. 验证通过才写入+推送GitHub

安全机制：
- 执行前自动备份原文件
- 只允许追加新section，禁止修改已有section
- 写入后验证数据条数只增不减
- 验证失败自动回滚
"""

import json
import sys
import os
import shutil
import subprocess
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data-reading.json')
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backups')
GITHUB_PAT = os.environ.get('GITHUB_PAT', '')
REPO_DIR = os.path.dirname(os.path.abspath(__file__))

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def count_sections(data):
    """统计所有section数量"""
    total = 0
    for bk in data:
        total += len(bk.get('sections', []))
    return total

def count_chats(data):
    """统计所有对话条数"""
    total = 0
    for bk in data:
        for sec in bk.get('sections', []):
            chat = sec.get('report', {}).get('chat', {})
            for key in ['fact', 'debate', 'chain']:
                total += len(chat.get(key, []))
    return total

def get_section_ids(data):
    """获取所有section id集合"""
    ids = set()
    for bk in data:
        for sec in bk.get('sections', []):
            ids.add(sec['id'])
    return ids

def backup():
    """备份当前数据文件"""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = os.path.join(BACKUP_DIR, f'data-reading_{ts}.json')
    shutil.copy2(DATA_FILE, backup_path)
    print(f'✅ 已备份到 {backup_path}')
    return backup_path

def validate_section(sec):
    """验证单个section的数据结构"""
    required_fields = ['id', 'range', 'report']
    for f in required_fields:
        if f not in sec:
            raise ValueError(f'section缺少必填字段: {f}')
    
    report = sec['report']
    report_required = ['date', 'status', 'factCount', 'debateCount', 'chat']
    for f in report_required:
        if f not in report:
            raise ValueError(f'{sec["id"]}: report缺少必填字段: {f}')
    
    chat = report['chat']
    for key in ['fact', 'debate']:
        if key not in chat or len(chat[key]) == 0:
            raise ValueError(f'{sec["id"]}: chat.{key}不能为空')
    
    # 验证chainCount与chain数组长度一致
    chain_count = report.get('chainCount', 0)
    chain_actual = len(chat.get('chain', []))
    if chain_count > 0 and chain_actual == 0:
        raise ValueError(f'{sec["id"]}: chainCount={chain_count}但chain为空')
    
    return True

def main():
    if len(sys.argv) < 2:
        print('用法: python3 update-reading-data.py <new_section_json_file>')
        print('  new_section_json_file: 包含新section数据的JSON文件')
        print('  格式: {"book_id": "b4", "section": {...}}')
        sys.exit(1)
    
    new_data_file = sys.argv[1]
    
    # 1. 读取当前数据
    print('📖 读取当前数据...')
    current_data = load_json(DATA_FILE)
    old_section_count = count_sections(current_data)
    old_chat_count = count_chats(current_data)
    old_section_ids = get_section_ids(current_data)
    print(f'  当前: {len(current_data)}本书, {old_section_count}个section, {old_chat_count}条对话')
    
    # 2. 读取新数据
    print(f'📄 读取新数据: {new_data_file}')
    new_input = load_json(new_data_file)
    
    if 'book_id' not in new_input or 'section' not in new_input:
        print('❌ 新数据格式错误，需要: {"book_id": "bX", "section": {...}}')
        sys.exit(1)
    
    book_id = new_input['book_id']
    new_section = new_input['section']
    
    # 3. 检查是否重复
    if new_section['id'] in old_section_ids:
        print(f'❌ section {new_section["id"]} 已存在，禁止覆盖！')
        sys.exit(1)
    
    # 4. 验证新section结构
    print(f'🔍 验证新section: {new_section["id"]}')
    validate_section(new_section)
    print('  ✅ 结构验证通过')
    
    # 5. 备份
    backup_path = backup()
    
    # 6. 追加新section
    print(f'📝 追加section到book {book_id}...')
    found = False
    for bk in current_data:
        if bk['id'] == book_id:
            bk['sections'].append(new_section)
            found = True
            break
    
    if not found:
        print(f'❌ 未找到book_id={book_id}，请先添加书籍')
        sys.exit(1)
    
    # 7. 写入后验证
    new_section_count = count_sections(current_data)
    new_chat_count = count_chats(current_data)
    
    if new_section_count != old_section_count + 1:
        print(f'❌ section数量异常: {old_section_count} -> {new_section_count}')
        shutil.copy2(backup_path, DATA_FILE)
        sys.exit(1)
    
    if new_chat_count < old_chat_count:
        print(f'❌ 对话条数减少: {old_chat_count} -> {new_chat_count}，数据丢失！')
        shutil.copy2(backup_path, DATA_FILE)
        sys.exit(1)
    
    # 验证所有旧section仍然存在
    new_section_ids = get_section_ids(current_data)
    if not old_section_ids.issubset(new_section_ids):
        lost = old_section_ids - new_section_ids
        print(f'❌ 旧section丢失: {lost}')
        shutil.copy2(backup_path, DATA_FILE)
        sys.exit(1)
    
    print(f'  ✅ 验证通过: {new_section_count}个section, {new_chat_count}条对话')
    
    # 8. 写入文件
    save_json(DATA_FILE, current_data)
    print(f'✅ 数据已写入 {DATA_FILE}')
    
    # 9. 推送GitHub
    if GITHUB_PAT:
        print('🚀 推送GitHub...')
        os.chdir(REPO_DIR)
        subprocess.run(['git', 'add', 'kids/data-reading.json'], check=True)
        msg = f'auto: 新增{new_section["id"]}验收数据 ({new_section["range"]})'
        subprocess.run(['git', 'commit', '-m', msg], check=True)
        result = subprocess.run(
            ['git', 'push', f'https://{GITHUB_PAT}@github.com/najia-zeng/najia-studio.git', 'main'],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            print('✅ 已推送GitHub')
        else:
            print(f'⚠️ 推送失败: {result.stderr}')
            print('  数据已保存到本地，可手动推送')
    else:
        print('⚠️ 未设置GITHUB_PAT环境变量，跳过推送')
        print('  数据已保存到本地，可手动推送')
    
    print(f'\n🎉 完成！新增section: {new_section["id"]} ({new_section["range"]})')

if __name__ == '__main__':
    main()
