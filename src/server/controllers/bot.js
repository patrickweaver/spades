export function index(req, res) {
  res.json({ status: "ok" });
}

export function test(req, res) {
  res.json({ status: "ok" });
}

export function finish(req, res) {
  res.json({ status: "ok" });
}

export function bid(req, res) {
  const { strategy, handCards } = req.body;

  res.json({ bid: 2 });
}

export function play(req, res) {
  const { strategy, handCards } = req.body;
  const legalCards = handCards
    .map((card, index) => ({ ...card, index }))
    .filter((card) => card?.legal);
  console.log({ legalCards });
  res.json({ index: legalCards[0].index });
}

export function scoreHand(req, res) {
  res.json({ status: "ok" });
}

export function trickUpdate(req, res) {
  res.json({ status: "ok" });
}
