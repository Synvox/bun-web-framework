# 08-generators

```bash
bun index.ts
```

## Entry

```
http://localhost:4000/index.ts
```

- Same thing as before but we've removed the `write` function and replaced it with a generator.
  - `function*` makes a generator function
  - You can "Return" multiple times using `yield`
- Using only node apis. This could run in node.
- No dependencies (except for typescript)
