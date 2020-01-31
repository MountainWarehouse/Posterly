export function groupBy<TKey, TValue>(items: TValue[], keyGetter: (item: TValue) => TKey): Map<TKey, TValue[]> {
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

export function sortArray<T>(items: T[], getProp: (item: T) => any, reverse?: boolean) {
    const greaterValue = reverse ? -1 : 1;
    const smallerOrEqValue = greaterValue * -1;
    items.sort((a: T, b: T) => (getProp(a) > getProp(b) ? greaterValue : smallerOrEqValue));
}
