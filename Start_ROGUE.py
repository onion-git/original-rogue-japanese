import subprocess
import tkinter as tk
from pathlib import Path

root = tk.Tk()
root.overrideredirect(True)
root.geometry("320x160")

title_bar = tk.Frame(root, bg="#333")
title_bar.pack(fill="x")

title = tk.Label(
    title_bar,
    text="元祖 ローグ 日本語版",
    bg="#333",
    fg="white",
    font=("Meiryo UI", 10),
)
title.place(relx=0.5, rely=0.5, anchor="center")

close_button = tk.Button(
    title_bar,
    text="×",
    command=root.destroy,
    bg="#333",
    fg="white",
    bd=0,
    padx=12,
)
close_button.pack(side="right")

label0 = tk.Label(root, text="")
label = tk.Label(
    root,
    text="Start ボタンで起動します",
    font=("Meiryo UI", 14),
)
label.pack(pady=(20, 10))

label1 = tk.Label(root, text="")
label1.pack()

# .batファイルのパスを指定
# batch_path = Path(r"C:\path\to\your\game.bat")
batch_path = Path(__file__).resolve().parent / "START_ROGUE.bat"

def start_batch():
    if not batch_path.is_file():
        label.config(text=f"ファイルが見つかりません:\n{batch_path}")
        return

    try:
        subprocess.Popen(
            ["cmd.exe", "/c", str(batch_path)],
            cwd=str(batch_path.parent),
        )
    except OSError as e:
        label.config(text=f"起動できませんでした: {e}")

button = tk.Button(
    root,
    text="Start",
    command=start_batch,
    font=("Meiryo UI", 14),
    bg="blue",
    fg="white",
)
button.pack()

def start_move(event):
    root._drag_x = event.x
    root._drag_y = event.y

def move_window(event):
    x = root.winfo_pointerx() - root._drag_x
    y = root.winfo_pointery() - root._drag_y
    root.geometry(f"+{x}+{y}")

title_bar.bind("<Button-1>", start_move)
title_bar.bind("<B1-Motion>", move_window)
title.bind("<Button-1>", start_move)
title.bind("<B1-Motion>", move_window)

root.mainloop()