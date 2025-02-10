# press-reader

This application is an alternative to Cafeyn.

## UI

![image](https://github.com/pdulvp/press-reader/assets/28950124/42133d28-63bd-4381-b2b8-a9b61b37399c)

## Domain Adaptor

To work properly, this website needs to provide an `adaptor` that will make the bridge between this site and the press service provider.

A domain adaptor must provides this following API:

`getBooks: [ { code, group, latest { date }, name }... ]`
  
`getPages: (code, date) => [ idPage... ]`

`getArchives: (code) => [ { code, date}... ]`

`getImage (idPage) => Buffer`

`getThumbnail (code, date) => Buffer`

### Installation

Install the adaptor `yourAdaptorh.js` in adaptorh folder and start `node index yourAdaptorh`

