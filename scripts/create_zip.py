import os
import zipfile
import shutil

EXCLUDE_DIRS = {
    'node_modules',
    '.git',
    '.aistudio',
    'dist',
    '__pycache__',
    '.turbo',
    '.next'
}

EXCLUDE_FILES = {
    'staffsync-hrms.zip',
    '.DS_Store',
    '.env',
    '.env.local'
}

def create_archive():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    out_zip = os.path.join(root_dir, 'staffsync-hrms.zip')
    public_dir = os.path.join(root_dir, 'frontend', 'public')
    os.makedirs(public_dir, exist_ok=True)
    public_zip = os.path.join(public_dir, 'staffsync-hrms.zip')

    with zipfile.ZipFile(out_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for foldername, subfolders, filenames in os.walk(root_dir):
            # Prune excluded directories
            subfolders[:] = [d for d in subfolders if d not in EXCLUDE_DIRS]
            
            for filename in filenames:
                if filename in EXCLUDE_FILES or filename.startswith('.env.'):
                    continue
                filepath = os.path.join(foldername, filename)
                relpath = os.path.relpath(filepath, root_dir)
                
                # Exclude if in public/staffsync-hrms.zip or dotfiles (except .env.example, .gitignore)
                if relpath == os.path.join('public', 'staffsync-hrms.zip') or relpath.startswith('.'):
                    if relpath != '.env.example' and relpath != '.gitignore':
                        continue
                
                zf.write(filepath, relpath)
                print(f"Added: {relpath}")

    # Copy to public/ so it can be served and downloaded directly via browser URL
    shutil.copyfile(out_zip, public_zip)
    print(f"\nSuccessfully created {out_zip} ({os.path.getsize(out_zip)} bytes)")
    print(f"Copied to {public_zip}")

if __name__ == '__main__':
    create_archive()
