const calcDepth = (books) => {
  if (books.length === 0) {
    return 0;
  }

  if (!Array.isArray(books[0])) {
    return 1;
  }

  return Math.max(...books.map(sub => calcDepth(sub))) + 1;
};

const walk = (entries, f, inc, maxDepth, depth, totalAngle) => {
  let localAngle = 0;
  let terminal = false;

  entries.forEach((e) => {
    if (!Array.isArray(e)) {
      f(e, totalAngle + localAngle);
      localAngle += inc;
      terminal = true;
    } else {
      localAngle += walk(e, f, inc, maxDepth, depth + 1, totalAngle + localAngle);
    }
  });

  return localAngle + (terminal ? maxDepth - depth + 1 : 1) * inc;
};

export default (
  {
    'base-separation': baseSeparation,
    books: nested,
    connections,
    categories,
  },
) => {
  const books = {};
  const maxDepth = calcDepth(nested);

  const connectionTypes = connections.reduce((acc, c) => ({
    ...acc,
    [c.id]: { ...c, active: true },
  }), {});

  const groupedCategories = categories.reduce((acc, c) => ({
    ...acc,
    [c.id]: { ...c, active: true },
  }), {});

  walk(
    nested,
    (b, angle) => {
      const bookCategories = b.categories.map(c => groupedCategories[c]);
      books[b.id] = {
        ...b,
        categories: bookCategories,
        angle,
        get active() {
          return bookCategories.reduce((active, c) => active && c.active, true);
        },
      };
    },
    baseSeparation,
    maxDepth,
    1,
    0,
  );

  const flatBooks = Object.values(books).filter(b => b.publication !== undefined);
  flatBooks.sort((a, b) => a.publication - b.publication);

  const sortedBooks = flatBooks.reduce((acc, b, i) => ({
    ...acc,
    [b.id]: {
      ...b,
      angle: i * (360 / (flatBooks.length + 1)),
      padding: 0,
      get active() {
        return b.categories.reduce((active, c) => active && c.active, true);
      },
    },
  }), {});

  return {
    books, sortedBooks, connectionTypes, categories: groupedCategories,
  };
};
