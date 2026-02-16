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

## Als je klaar bent met jouw taak, push je branch

```bash
git status
git add .
git commit -m "Commit message"
git push -u origin branch-name
```

## Merge je branch met main

```bash
git switch main
git pull
git merge branch-name
git push
```

## Nu kan iedereen de wijzingen in main zien
