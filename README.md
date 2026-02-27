# Team-RAM

## Hoe kan je een commit doen

```bash
git pull
git add .
git commit -m "Commit message"
git push
```

## Hoe maak je een branch

```bash
git switch -c branch-Name
```

Als je klaar bent met jouw taak, push je branch

```bash
git status
git add .
git commit -m "Commit message"
git push -u origin branch-name
```

Merge je branch met main

```bash
git switch main
git pull
git merge branch-name
git push
```

## Setup Tailwind CSS

Install all dependencies

```bash
npm install
```

Then generate the Tailwind output.css file

```bash
npm run dev
```

Make sure to link output.css as first link in your HTML files

```html
<link rel="stylesheet" href="/public/css/output.css" />
```

Keep npm run dev running while working on Tailwind styles so changes are generated automatically
