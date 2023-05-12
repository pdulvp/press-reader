# press-reader

This application is useful when a press service provider is images for each pages of a press newspaper. It will download images and generates a PDF from it.

## Current UI

![image](https://user-images.githubusercontent.com/28950124/236561407-4ceb3f50-1b75-47ed-bee4-900e9457519a.png)

## Domain Adaptor

To work properly, this website needs to provide an `adaptor` that will make the bridge between this site and the press service provider.

A domain adaptor must provides this following API:

`getBooks: [ code, group, latest { date }, name ]`
  
`getPages: (code, date) => [ { idPage } ]`

`getArchives: (code) => [ code, date ]`

`fetchImage (imageFile, idPage)`

### Installation

Install the adaptor `yourAdaptorh.js` in adaptorh folder and start `node index yourAdaptorh`

