function groupBy<TKey, TValue>(items: TValue[], keyGetter: (item: TValue) => TKey): Map<TKey, TValue[]> {
    const map = new Map();
    items.forEach(item => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

export default groupBy;
