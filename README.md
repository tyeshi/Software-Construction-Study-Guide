# SoCo Study Sessions

An interactive Software Construction study plan with nine sessions, checklists, notes, and three practice exams with separate solution sheets. The plan uses two hours per full week and nine hours total, preparing for 16 December 2026.

## Using the guide

1. Open the website and start with Session 1.
2. Follow the tasks, using the suggested minutes and linked book chapters or PDFs.
3. Tick each completed task. Once all tasks are checked, **Next session** becomes available.
4. Use **My notes & corrections** to record what you learned.
5. Revisit any session using the session list, or use **Previous**.

Use Exams A and B for targeted practice. Keep Exam C for the 90-minute rehearsal, then use its separate solution sheet in the 30-minute review session. **Papers & resources** contains all the PDFs.

Progress and notes are stored in your browser on your device. They are not uploaded to GitHub or synchronized between devices. Use the same browser and exact address each time: `localhost` and `127.0.0.1`, different ports, and the hosted site have separate storage. Clearing site data removes saved progress.

## Run locally in VS Code

You need Python 3 and a browser. No package installation or build is required.

1. Download this repository using **Code → Download ZIP** and extract it, or clone it using the URL under **Code**.
2. In VS Code, select **File → Open Folder** and open the downloaded repository.
3. Open **Terminal → New Terminal**.
4. Run the command for your folder layout:

If `index.html` is directly inside the repository:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

If the website files are inside `dist/`:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

On Windows, replace `python3` with `py`.

Open **http://127.0.0.1:8000**. Keep the terminal running while studying. Press **Ctrl+C** to stop. Run the same command next time to resume.

Your friends cannot access your computer using this localhost address. Share a hosted URL using the next section, or have them download their own copy.


## Troubleshooting

- **Page will not load:** start the local server and keep its terminal open. Check the address and port.
- **A file listing appears:** you are serving the wrong folder. Use the directory containing `index.html`, or the `--directory dist` command.
- **Port already in use:** stop the earlier server with Ctrl+C, or choose another port such as 8001. A new port has separate saved progress.
- **Next is disabled:** tick every task in the current session. You can still select any session from the session list.
- **Progress looks missing:** check the browser, device and exact address. Private browsing may discard progress when closed.
- **PDF link fails:** keep the complete `resources/` folder beside `index.html` and preserve filenames.
- **GitHub Pages shows 404:** check that `index.html` is in the selected publishing folder and that the deployment succeeded in the repository's Actions tab.

## Learning material

Based on the supplied course schedule, learning goals and historical exam format, with reading links to Greg Wilson's [Software Design by Example](https://third-bit.com/sdxpy/). The practice questions and rubrics are independent study material. Confirm the current exam rules and logistics with the course announcement.
