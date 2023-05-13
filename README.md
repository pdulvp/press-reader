# press-reader

This application is useful when a press service provider is images for each pages of a press newspaper. It will download images and generates a PDF from it.

## UI

![image](https://github.com/pdulvp/press-reader/assets/28950124/0bdcf5c2-ab4e-4aca-a66d-f11e111d72f3)

## Domain Adaptor

To work properly, this website needs to provide an `adaptor` that will make the bridge between this site and the press service provider.

A domain adaptor must provides this following API:

`getBooks: [ code, group, latest { date }, name ]`
  
`getPages: (code, date) => [ { idPage } ]`

`getArchives: (code) => [ code, date ]`

`getImage (idPage)`

### Installation

Install the adaptor `yourAdaptorh.js` in adaptorh folder and start `node index yourAdaptorh`

