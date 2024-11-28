# README

## mac display
- full screen : control + command + F

### rectangle shortcut key
- Left Half when exit full screen : option + command + < or >
- diplay move : control + option + command + < or >

### progarm
- Rectangle : https://rectangleapp.com/
- display link : https://www.synaptics.com/products/displaylink-graphics/downloads/macos

## github page deploy

### 1. gh-pages install
```shell
npm install gh-pages
```
### 2. Github page address setting
```json
// package.json
{
    // ...,
    "homepage": "https://{github account}.github.io/{project name}",
    // ...
}
```
### 3. build, publish command add
```json
// package.json
{
    //...,
    "scripts": {
        //...,
        "predeploy": "npm run build",
        "deploy": "gh-pages -d build"
        //...
    }
    //...
}
```
### 4. "deploy" command execute
```shell
npm run deploy
```

## vite
- https://ko.vite.dev/guide/

### Why Vite
- https://vite.dev/guide/why.html

## project
### 모바일 청첩장 (react)
- branch : backup_mobile_wedding_card
- reference : https://github.com/heejin-hwang/mobile-wedding-invitation
