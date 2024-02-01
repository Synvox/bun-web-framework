# 07-components

```bash
bun index.ts
```

## Entry

```
http://localhost:4000/index.ts
```

- html tag implicitly writes html. That's weird.
- The component system
  - This is a very simple component system. We'll replace it with jsx in a little bit.
  - Notice we write the component using typescript, but we don't use typescript to render it. We can use `toString` to render it.
- Still streaming. See `stream.ts`
  - Unlike Remix, or Next, we send the javascript and the html at the same time. HTML runs javascript as it's received.
    - When it's a `<script>` tag. Some attributes change that behavior.
- Using only node apis. This could run in node.
- No dependencies (except for typescript)
