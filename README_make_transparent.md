# make_transparent.py
From the project root in VS Code terminal (Windows PowerShell):
```powershell
py -3 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install rembg Pillow onnxruntime
python make_transparent.py
```
Output files are written to `public\varieties\transparent` as `.png`.
Use another folder with: `python make_transparent.py --input "C:\path\to\images"`.
