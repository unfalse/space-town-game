# `levels.json` format

The game server reads and writes **`src/server/levels.json`** (path resolved from the process working directory: `process.cwd() + '/src/server/levels.json'`). It must be valid JSON.

## Top-level shape

```json
{
  "levels": [
    {
      "id": "1",
      "name": "myLevelName",
      "data": "<see below>"
    }
  ]
}
```

| Field | Meaning |
|--------|---------|
| `levels` | Array of level entries. |
| `id` | String identifier used by the API (`GET /level?id=…`) and when saving. Must match an existing level’s `id` for `POST /save` to update it. |
| `name` | Display name shown in the editor’s Load list (`GET /list` returns `id` and `name` only). |
| `data` | A single string that encodes the player spawn and all placed objects. See **Level data string** below. |

## HTTP usage (reference)

- **`GET /list`** — returns `{ id, name }[]` for each level.
- **`GET /level?id=<id>`** — returns the full level object `{ id, name, data }`.
- **`POST /save`** — body should be `{ id, name, data }`; updates the level whose `id` matches and rewrites `levels.json`.

The editor serializes levels with `Editor.prepareLevelForSaving()` in `src/editor/editor.ts` and parses them in `loadTheEditorLevel()`.

## Level `data` string

Conceptually, `data` is a sequence of **records** separated by **`|`** (pipe).

### Record 0 — player start cell

Always present when saving from the editor:

```text
<playerX>;<playerY>|
```

- Values are **pixel coordinates** of the top-left corner of the player’s cell (same grid as `CONST.CELLSIZES`: typically 40×40 px cells).
- The loader creates a **player** unit at this position (`CONST.TYPES.PLAYER`).

### Records 1…N — level objects

Each following record describes one object. Two shapes are accepted by the loader.

#### A) Full form (what the editor saves today)

```text
<waypoints>;<ghost>;<type>;<y>;<x>|
```

| Part | Description |
|------|--------------|
| `waypoints` | For **enemy ships** (`type === 0`, `SHIP`): JSON array of waypoint pairs, e.g. `[[240,440],[320,440],…]`. Each pair is `[x, y]` in pixels. For non-ship objects this is an **empty string**. |
| `ghost` | `"true"` or `"false"` — whether the object was stored as a ghost in the editor (usually `false` for normal units). |
| `type` | Integer **object type**; see **Object type IDs** below. |
| `y` | Pixel Y of the object’s position. |
| `x` | Pixel X of the object’s position. |

**Note:** Serialization order is **y** then **x**, despite the common “x, y” wording elsewhere.

#### B) Legacy short form

If a record contains **no** `;` (so splitting by `;` yields a single field), it is treated as:

```text
<type>,<x>,<y>
```

(comma-separated). The loader passes `x`, `y`, and `type` into `createEditorUnit`. Older or hand-edited levels may use this for simple tiles.

### Object type IDs

These match `CONST.TYPES` in `src/const.ts` / `ObjectType` in `src/types.ts`:

| Value | Constant | Role |
|------:|----------|------|
| -1 | `ERASER` | Editor tool only, not stored as level geometry in normal saves. |
| 0 | `SHIP` | Enemy ship (optionally with `waypoints`). |
| 1 | `OBSTACLE` | Indestructible block. |
| 2 | `SPACEBRICK` | Destructible block. |
| 3 | `COUNTER` | Counter / special tile. |
| 4 | `BORDER` | Border tile. |
| 5 | `WAYPOINT` | Waypoint marker (editor). |
| 6 | `WAYPOINTERASER` | Waypoint eraser (editor). |
| 7 | `PLAYER` | Player start (normally only via record 0). |
| 8 | `STATICSHIP` | Static ship. |
| 9 | `BULLET` | Not used as level geometry. |
| 10 | `DELAYED_PIC` | Effect, not normal level data. |

## Example (minimal)

Player at (0, 360), one obstacle at (40, 80):

```text
0;360|;false;1;80;40|
```

- Record 0: `0;360` → player at x=0, y=360.
- Record 1: empty waypoints (`;`…), `ghost=false`, type `1` (obstacle), y=80, x=40.

## Example (ship with waypoints)

```text
0;360|[[240,440],[320,440]];false;0;240;320|
```

Enemy ship (`type` 0) at x=320, y=240 with two waypoints (coordinates in the JSON array).

## Implementation references

| Concern | Location |
|---------|----------|
| Serialize `data` | `Editor.prepareLevelForSaving()` — `src/editor/editor.ts` |
| Parse `data` | `Editor.loadTheEditorLevel()` — same file |
| Read/write file | `src/server/index.ts` (`filename = 'levels.json'`) |

## Notes

- Some shipped levels mix styles or contain very long `data` strings; the grammar above is what **current editor save/load** expects.
- Invalid numbers or malformed JSON in `waypoints` can break `JSON.parse` at load time; hand-edited files should keep the full form consistent.
- The `/new` route in the server currently writes to `levelsTest.json` rather than `levels.json`; normal editing flow uses **Save** (`POST /save`).
