# struct-fs

`struct-fs` creates a structured representation of your file system that respects `.ignore` directives. Traverse a directory with options to filter, seal, or redact ignored files and directories.

This outputs unhydrated purely structural data that represents a snapshot of a filesystem hierarchy as data, it does not interact with the file system itself beyond reading it's contents to generate the snapshot.

## Features

- **Respects** `**.gitignore**` (or a custom ignore file)
- **Flexible directory and file filtering**

    - `ignore`: Completely removes ignored items
    - `seal`: Keeps ignored directories but hides their contents
    - `redact`: Keeps ignored items but replaces names with custom placeholders

- **Supports absolute or relative paths**
- **Handles symbolic links**

## Install

`npm install struct-fs`

## Usage

```js
import structFs from 'struct-fs';

const result = await structFs('./my-project', {
    recursive: true,
    dirMode: 'seal',
    fileMode: 'ignore',
    hiddenMode: 'redact',
});

console.log(JSON.stringify(result, null, 2));
```

## API

### `structureFslite(dir, options)`

#### Parameters:

- **`dir`** _(string)_ - The directory to scan.

- **`options`** _(object, optional)_ - Configuration options:

| Option             | Type      | Default      | Description                                                          |
| ------------------ | --------- | ------------ | -------------------------------------------------------------------- |
| `ignoreFile`       | `string`  | `.gitignore` | The ignore file to use.                                              |
| `dirMode`          | `string`  | `'ignore'`   | Behavior for ignored directories (`'ignore'`, `'seal'`, `'redact'`). |
| `fileMode`         | `string`  | `'ignore'`   | Behavior for ignored files (`'ignore'`, `'redact'`).                 |
| `hiddenMode`       | `string`  | `'ignore'`   | Behavior for hidden directories (`'ignore'`, `'seal'`, `'redact'`).  |
| `absolutePaths`    | `boolean` | `false`      | Return absolute paths instead of relative ones.                      |
| `recursive`        | `boolean` | `false`      | Whether to traverse directories recursively.                         |
| `redactedDirName`  | `string`  | `'!dir'`     | Placeholder name for redacted directories.                           |
| `redactedFileName` | `string`  | `'!file'`    | Placeholder name for redacted files.                                 |

#### Returns:

- A `Promise` resolving to a structured object:

```json
{
    "path": "./my-project",
    "children": [
        { "path": "src", "children": [] },
        { "path": "!dir", "children": [] },
        { "path": "index.js" }
    ]
}
```

## Related Packages

- [https://github.com/alexstevovich/struct-fsraw](https://github.com/alexstevovich/struct-fsraw) – Generates an unfiltered raw structural representation of a directory including file sizes and meta data. A heavier op without .ignore filters but much closer to the metal with richer output.

<sub>_These links might be suffixed with "-node" in the future if conflicts arise._</sub>

## Links

### Development Homepage

[https://github.com/alexstevovich/struct-fs](https://github.com/alexstevovich/struct-fs)

<sub>_This link might be suffixed with "-node" in the future if conflicts arise._</sub>

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
