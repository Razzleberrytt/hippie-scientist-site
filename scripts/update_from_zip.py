import shutil
import zipfile
import tempfile
from pathlib import Path


def main() -> None:
    zip_path = Path('hippie-scientist-site-main_consolidated.zip')
    if not zip_path.exists():
        print(f"Archive '{zip_path}' not found in the project root")
        return

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)
            print(f"Extracting {zip_path}...")
            with zipfile.ZipFile(zip_path, 'r') as zf:
                zf.extractall(tmpdir)
            print("Extraction complete.")

            # Remove existing src directory
            src_dir = Path('src')
            if src_dir.exists():
                print("Removing existing 'src/' directory...")
                shutil.rmtree(src_dir)

            # Remove old data file
            old_data_file = Path('src/data/herbs_enriched.json')
            if old_data_file.exists():
                print("Removing old data file 'src/data/herbs_enriched.json'...")
                old_data_file.unlink()

            # Move new src directory
            new_src = tmpdir_path / 'src'
            if new_src.exists():
                print("Moving new 'src/' directory into project root...")
                shutil.move(str(new_src), str(src_dir))
            else:
                print("No 'src/' directory found in the archive")

            # Move new herbs data file
            new_data_file = tmpdir_path / 'herbs_consolidated.json'
            if new_data_file.exists():
                dest_data_file = Path('herbs_consolidated.json')
                print("Moving 'herbs_consolidated.json' into project root...")
                shutil.move(str(new_data_file), dest_data_file)
            else:
                print("'herbs_consolidated.json' not found in the archive")

            print("Update complete.")
    except Exception as e:
        print(f"Error during update: {e}")


if __name__ == '__main__':
    main()
