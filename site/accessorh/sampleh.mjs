
import { dateh } from "../dateh.mjs"

export default {
  getBooks: () => {
    let result = [
       { code: "CITIES", name: "Cities", group: "Road", latest: { date: "2023-01-02" }, }, 
       { code: "FOREST", name: "Forest", group: "Nature", latest: { date: "2023-01-02" }, }, 
       { code: "ROAD", name: "Road", group: "Road", latest: { date: "2023-01-02" }, }, 
       { code: "FLOWER", name: "Flowers", group: "Nature", latest: { date: "2023-01-02" }, }, 
       { code: "WOOD", name: "Wood", group: "Nature", latest: { date: "2023-01-02" }, }, 
       { code: "BEACH", name: "Beach", group: "Nature", latest: { date: "2023-01-02" }, }, 
       { code: "MOUNTAIN", name: "Mountain", group: "Travel", latest: { date: "2023-01-03" }, }, 
       { code: "TREK", name: "Trek", group: "Travel", latest: { date: "2023-01-02" }, }, 
    ];
    return Promise.resolve(result);
  },

  getPages: (code, date) => {
    date = dateh.formatDate(date, "-");
    let pages = {
      "CITIES_2023-01-02": [ 670, 737, 740  ],
      "CITIES_2023-01-01": [ 743, 857, 947, 953,  ],
      "FOREST_2023-01-02": [ 878, 877, 880 ],
      "FOREST_2023-01-01": [ 921, 924, 925,],
      "ROAD_2023-01-02": [ 667, 688 ],
      "FLOWER_2023-01-02": [ 958, 976, 977, ],
      "FLOWER_2023-01-01": [ 696, 701 , 940, ],
      "WOOD_2023-01-02": [ 844, 919 ],
      "BEACH_2023-01-02": [ 653, 788, 896, 913, 912 ],
      "BEACH_2023-01-01": [ 657, 689, 732, 756, 867, 871 ],
      "TREK_2023-01-02": [ 875, 881, 970, 973 ],
      "TREK_2023-01-01": [  872, 910, 980 ],
      "MOUNTAIN_2023-01-03": [ 702, 791, 981 ],
      "MOUNTAIN_2023-01-02": [ 651, 684, 829, 908 ],
      "MOUNTAIN_2023-01-01": [ 906, 931, 929 ],
    }
    return Promise.resolve(pages[code+"_"+date]);
  },

  getArchives: (code) => {
    let archives = {
      "CITIES": [ 
        { code: "CITIES", date: "2023-01-02" },
        { code: "CITIES", date: "2023-01-01" }
       ],
      "FOREST": [ 
        { code: "FOREST", date: "2023-01-02" },
        { code: "FOREST", date: "2023-01-01" }
       ],
      "FLOWER": [ 
        { code: "FLOWER", date: "2023-01-02" },
        { code: "FLOWER", date: "2023-01-01" }
       ],
       "BEACH": [ 
         { code: "BEACH", date: "2023-01-02" },
         { code: "BEACH", date: "2023-01-01" }
        ],
      "MOUNTAIN": [
        { code: "MOUNTAIN", date: "2023-01-03" },
        { code: "MOUNTAIN", date: "2023-01-02" },
        { code: "MOUNTAIN", date: "2023-01-01" }
       ],
       "TREK": [
         { code: "TREK", date: "2023-01-02" },
         { code: "TREK", date: "2023-01-01" }
        ],
    }
    let result = archives[code.split("_")[0]];
    if (result == undefined) result = [];
    console.log(result);
    return Promise.resolve(result);
  },

  getImage: (imageId) => {
    let id = imageId;
    return fetch(`https://picsum.photos/id/${id}/200/300`, {
        "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json; charset=utf-8",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Microsoft Edge\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      "referrer": "https://cloudfront.net/",
      "referrerPolicy": "strict-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
      }).then(response => {
        return response.arrayBuffer();
      }).then(arrayBuffer => {
        return Promise.resolve(Buffer.from(arrayBuffer));
      });
  }
}
