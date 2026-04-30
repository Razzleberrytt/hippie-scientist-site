export const AMAZON_ASSOCIATE_ID = "razzleberry02-20";

export function buildAmazonSearchUrl(query: string) {
  const encoded = encodeURIComponent(query);
  return `https://www.amazon.com/s?k=${encoded}&tag=${AMAZON_ASSOCIATE_ID}`;
}

export function getHerbSearchLinks(herbName: string) {
  return [
    {
      label: "Extract",
      url: buildAmazonSearchUrl(`${herbName} extract standardized`)
    },
    {
      label: "Capsule",
      url: buildAmazonSearchUrl(`${herbName} capsules`)
    },
    {
      label: "Tea",
      url: buildAmazonSearchUrl(`${herbName} tea`)
    }
  ];
}
