#### [EN]
# SPACE TOWN

A 2D browser-based four-way scroll shooter with a space background. Written in pure TypeScript without any third-party libraries, excluding Webpack and Express. The game is a prototype: the player is immortal, can destroy bots, and bots can destroy each other. The AI is primitive, capable of chasing the player and shooting if they are nearby, as well as flying along predefined waypoints.
Bugs and crashes may occur.

You can fly around here [https://archthink.taila66f39.ts.net/](https://archthink.taila66f39.ts.net/) without having to deal with the build process.

## Contents

Source code for the game and the map editor. Several maps are included in the server folder. The **`levels.json`** file format is described in [docs/levels-json.md](docs/levels-json.md).

## Commands

Install packages:

`yarn`

Run in development mode:

`yarn dev`

After a successful launch and the "Server is running on port 80" message appears, you can go to http://localhost/ to fly and shoot around on an empty map.

In dev mode, nodemon runs and tracks changes in the src folder. If changes occur, the TS compiler and the Express server are triggered.

Run linter:

`yarn run lint`

## Game Controls

Movement: 4 Arrow keys or WASD
Stop: "h"
Fire: Spacebar

The player's spaceship gains speed when one of the four movement keys is held down. Inertia does not decay.

## Map Editor

The map editor is built into the game. Loading and saving maps is functional.

### Map Editor Controls

Press `F1` to enter the editor. The buttons New, Save, Save as, Load, and Play will appear above the game field. Currently, only Save, Load, and Play are available. The current brush is displayed to the left of the button block.

When you click Load, a list of levels available for loading appears on the left. Click on a level and press Play to fly through it.

In the editor, use the Arrow keys to move across the map and keys 1 through 7 to switch brushes. Clicking on the game field draws with the current brush.

Available brushes:

`1` - Erase block

`2` - Indestructible block

`3` - Enemy spaceship

`4` - Destructible block

`5` - Set bot waypoint

`6` - Remove bot waypoint

`7` - Set player starting position (not functional)

### Setting Waypoints

First, place a bot on the game field. Select brush `5` and click on the bot. Click again to set the starting point of the path; the number `1` will appear. Click on the desired cell to set the next waypoint.

To remove an incorrectly placed point, use brush `6`.

Currently, the lines between points (if connected) must be rectangular—meaning there must be a vertical or horizontal line between any two adjacent points at an angle of 180° or 0°, respectively. Otherwise, the bot will miss points and may veer off its route.

If the first waypoint is not placed directly on the bot, the bot may deviate from it if the player flies by and leads the bot away for a short time.

#### [RU]
# SPACE TOWN

Двухмерный браузерный четырёхсторонний скроллшутер с космическим фоном. Написан на чистом Typescript без библиотек от третьей стороны, не считая webpack и express. Игра является заготовкой, игрок бессмертен, может уничтожать ботов, боты могут уничтожать друг друга. Искусственный интеллект здесь самый примитивный и умеет преследовать игрока и стрелять в него, если он поблизости, а также летать по заранее указанным точкам следования.
Возможны баги и падения.

**Здесь [https://archthink.taila66f39.ts.net/](https://archthink.taila66f39.ts.net/) можно полетать и не мучиться со сборкой.**

## Содержимое

Исходный код игры и редактора карт. Несколько карт есть в папке с сервером.

## Команды

Установка пакетов

`yarn`

Запуск в режиме разработки

`yarn dev`

После успешного запуска и появления надписи "Server is running on port 80" можно переходить на http://localhost/ чтобы немного полетать и пострелять на пустой карте.

В режиме разработки запускается nodemon и отслеживает изменения в папке src. В случае изменений запускается компилятор ts и сервер на express.

Запуск линтера

`yarn run lint`

## Управление в игре

Движение: 4 стрелки управления курсором, WASD
Стоп: "h" 
Огонь: пробел

Звездолет игрока развивает скорость при долгом нажатии одной из четырех кнопок. Инерция не угасающая.

## Редактор карт

Редактор карт встроен в игру. Работает загрузка и сохранение карт.

### Управление в редакторе карт

Нажмите `F1` для перехода в редактор. Над игровым полем появятся кнопки New, Save, Save as, Load, Play. Из них пока доступны только Save, Load и Play. Слева от блока кнопок отображается текущая кисть.

При нажатии кнопки Load, слева появляется список уровней для загрузки. Кликните по одному из уровню и нажмите Play, чтобы полетать по нему.

В редакторе работают стрелки управления курсором для перемещения по карте и цифры от 1 до 7, они переключают кисть. Клик по игровому полю рисует текущей кистью.

Доступные кисти:

`1` - стереть блок

`2` - неразрушаемый блок

`3` - вражеский звездолет

`4` - разрушаемый блок

`5` - для установки точки маршрута ботов

`6` - для удаления точки маршрута ботов

`7` - для установки начального положения игрока (не работает)

### Установка точек следования

Для начала, поставьте одного бота на игровом поле. Выберите кисть `5` и кликните на боте. Кликните ещё раз, чтобы установить начальную точку пути, появится цифра 1. Кликните по желаемой клетке для установки следующей точки.

Чтобы удалить ошибочно установленную точку, используйте кисть `6`.

На данный момент линии между точками, если их соединить, должны быть прямоугольными, т.е. между любыми двумя соседними точками должна проходить вертикальная или горизонтальная линия под углом 180 или 0 градусов соответственно, иначе бот будет пропускать некоторые точки и может слететь со своего маршрута.

Если установить первую точку не на самом боте, он может слететь с неё, если игрок пролетит мимо и немного полетать за игроком.