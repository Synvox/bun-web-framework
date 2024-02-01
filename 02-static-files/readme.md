# 02-static-files

```bash
bun index.ts
```

## Entry

```
http://localhost:4000/index.html
```

## Notes

- Serve static files from a directory
- Streaming files from the file system
  - `fs.createReadStream`
- Using only node apis. This could run in node.
- No dependencies (except for typescript)
- Manual mime types (no `mime` package)
