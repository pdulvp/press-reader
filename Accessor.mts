

type Page = string;
type Code = string;
type Date = string;

type Book = {
  code: string;
  name: string;
}

type CodeAndDate = {
  code: Code, date: Date
}

type Accessor = {
  getThumbnail(code: Code, date: Date): Promise<string>
  getPages: (code: Code, date: Date) => Promise<Page[]>
  isFull: (code: Code) => Promise<boolean>
  getFull: (code: Code, date: Date) => Promise<Buffer>
  getBooks: () => Promise<Book[]>;
  getImage: (code: Code, imageId: string) => Promise<Buffer>
  getArchives: (code: Code) => Promise<CodeAndDate[]>
}

function combine(accessorhs): Accessor {
  let coveringAccessor = {};
  let cover = (code: Code) : Promise<Accessor> => {
    if (Object.keys(coveringAccessor).length == 0) {
      return Promise.all(accessorhs.map(a => a.getBooks())).then(bookResults => {
        bookResults.forEach((books, index) => books.forEach(book => coveringAccessor[book.code] = accessorhs[index]));
        console.log(code+"="+coveringAccessor[code].name);
        return Promise.resolve(coveringAccessor[code]);
      });
    } else {
      console.log(code+"="+coveringAccessor[code].name);
      return Promise.resolve(coveringAccessor[code]);
    }
  }
  return {
    getBooks: () => {
      return Promise.all(accessorhs.map(a => a.getBooks())).then(books => {
        return Promise.resolve(books.reduce((o,i) => o.concat(i), []));
      });
    },
    getPages: (code, date) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getPages(code, date);
        return Promise.reject("unsupported code");
      } );
    },
    getArchives: (code) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getArchives(code);
        return Promise.reject("unsupported code");
      } );
    },
    getImage: (code, imageId) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getImage(code, imageId);
        return Promise.reject("unsupported code");
      } );
    },
    getFull: (code, date) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getFull(code, date);
        return Promise.reject("unsupported code");
      } );
    },
    isFull: (code) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.isFull(code);
        return Promise.reject("unsupported code");
      } );
    },
    getThumbnail: (code, date) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getThumbnail(code, date);
        return Promise.reject("unsupported code");
      } );
    },
  }
}

export {
  type Accessor, type Page, type Code, type Date, type Book, type CodeAndDate, combine
  
}
