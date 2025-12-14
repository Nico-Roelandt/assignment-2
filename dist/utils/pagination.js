export function parseListQuery(q) {
    const page = Number.isInteger(Number(q.page)) && Number(q.page) >= 0 ? Number(q.page) : 0;
    const size = Number.isInteger(Number(q.size)) && Number(q.size) > 0
        ? Math.min(Number(q.size), 100)
        : 20;
    const rawSort = typeof q.sort === "string" ? q.sort : "id,DESC";
    const [field, dirRaw] = rawSort.split(",");
    const dir = dirRaw && dirRaw.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sortField = field || "id";
    return {
        page,
        size,
        sort: `${sortField},${dir}`,
        sortField,
        dir
    };
}
