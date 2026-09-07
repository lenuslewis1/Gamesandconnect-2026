// Web-sized copies from the Beach Hangout folder supplied by Games & Connect.
const files = ["IMG_0452","IMG_0453","IMG_0454","IMG_0456","IMG_0457","IMG_0458","IMG_0459","IMG_0460","IMG_0461","IMG_0463","IMG_0464","IMG_0466","IMG_0468","IMG_0470","IMG_0471","IMG_0472","IMG_0473","IMG_0474","IMG_0475","IMG_0476","IMG_0477","IMG_0478","IMG_0479","IMG_0480","IMG_0481","IMG_0484","IMG_0487","IMG_0488","IMG_0489","IMG_0490","IMG_0491","IMG_0492","IMG_0495","IMG_0496","IMG_0497","IMG_0498","IMG_0500","IMG_0501","IMG_0502","IMG_0503","IMG_0505","IMG_0506","IMG_0507","IMG_0510","IMG_0512","IMG_0514","IMG_0515","IMG_0516","IMG_0520","IMG_0521","IMG_0522","IMG_0523","IMG_0525"];
export const beachGallery = files.map((name, index) => ({
  id: 'beach-' + name,
  image_url: '/assets/games-connect/beach-hangout/' + name + '.jpg',
  caption: 'Beach Hangout · Photo ' + (index + 1),
  category: 'beach-hangout',
  created_at: '2026-09-07T00:00:00Z',
}));
