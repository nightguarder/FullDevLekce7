# FullDevLekce7

## Domácí úkol 7

- Deadline: 1.1.2024 23:59
- Počet bodů: 10

__Cílem tohoto úkolu je implementovat modul pro file storage__

- implementuj modul `FileStorage`, ktery bude mít následující metody
    - upload - pro nahrání souboru
    - download - pro stažení/vrácení obsahu souboru
    - delete - smazání souboru
    - list - seznam souborů
- pro jednoduchost není třeba uvažovat složky, pouze flat strukturu
- samozřejmě pokud chcete implementujte i složky 😃
- implementuj driver pro
    - lokální filesytém - `LocalFilesystemDriver`
    - S3 - `S3Driver`
- jak budu vypadat interface je na tobě. Tady je můj nápad jak by to mohlo vypadat, držet se toho nemusíš 🙂

```javascript

const s3Driver = new S3Driver({
    // s3 options, secret key, endpoint etc.
})

const fsDriver = new LocalFilesystemDriver({
    // local filesystem options
    path: './public'
})


$storage = new FileStorage({
    driver: // s3Driver nebo fsDriver
})

await $storage->upload('file.txt', data)
await $storage->delete('image_to_delete.jpg')

const list = await $storage->list()

const data = await $storage->download('file.txt')

```


## Notes


- jelikož `@aws-sdk` je jako ES modul, tak bude třeba udělat i aplikaci jako `type: module` (viz. [package.json v lesson7-s3](../lesson7-s3/package.json))
- doporučuju používat třidy, jak na to v rychlosti zde: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes

## Dependencies

```javascript

pnpm i express cors aws-sdk dotenv

```
