const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const cheerio = require('cheerio');

const baseURL = 'https://www.yellowpages.com';
const searchURL = '/search?search_terms=printing&geo_location_terms=New+York%2C+NY';

const getCompanies = async () => {
    const html = await rp(baseURL + searchURL);
    const businessMap = cheerio('a.business-name', html).map(async (_i, e) => {
    const link = baseURL + e.attribs.href;
    const innerHtml = await rp(link);
    let emailAddress = cheerio('a.email-business', innerHtml).prop('href');
    emailAddress = emailAddress ? emailAddress.replace('mailto:', '') : '';
    const name = e.children[0].data || cheerio('h1', innerHtml).text();
    const phone = cheerio('p.phone', innerHtml).text();

    return {
      emailAddress,
      link,
      name,
      phone,
    }
  }).get();
  return Promise.all(businessMap);
};

getCompanies()
  .then(result => {
    const transformed = new otcsv(result);
    return transformed.toDisk('./output.csv');
  })
  .then(() => console.log('SUCCESSFULLY COMPLETED THE WEB SCRAPING SAMPLE'));
