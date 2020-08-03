# Linksammlung

Eine kleines Dashboard das heufig benötigte Links grafisch darstellt

## Was soll sie können:

- hinzufügen neuer Links aus der Webseite heraus
- keine Authorisierung nötig
- Kategorien

## Datenmodel

```
{
    "title": "[String]",        //Titel
    "uuid": "[String]",         //UUID
    "href": "[String]",         //Der eigentliche link 
    "category": "[String]",     //Kategorie
    "desc": "[String]",         //Beschreibung
    "favicon": "[String]",      //Link zum Favicon
    "online": "[Boolean]"       //wird vom Server ausgefüllt
}
```

## Backend

Nodered mit mongodb

