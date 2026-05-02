/**
 * Consistent responsive widths for filter fields (MUI Grid v2 `size` prop).
 */
export const ACTION_BAR_FIELD_GRID = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3
};

export const ACTION_BAR_DATE_GRID = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3
};

export const ACTION_BAR_ACTIONS_GRID = { xs: 12 };

/**
 * Trim strings; coerce numeric fields; drop empty values for cleaner API queries.
 */
export function normalizeFormData(formData, items = []) {
    const out = { ...formData };
    const numberNames = new Set(
        items.filter((i) => i.type === 'number').map((i) => i.name)
    );

    for (const key of Object.keys(out)) {
        let v = out[key];
        if (v === '' || v === undefined || v === null) {
            delete out[key];
            continue;
        }
        if (typeof v === 'string') {
            const t = v.trim();
            if (t === '') {
                delete out[key];
                continue;
            }
            out[key] = t;
            v = t;
        }
        if (numberNames.has(key)) {
            const n = Number(v);
            if (Number.isNaN(n)) delete out[key];
            else out[key] = n;
        }
    }
    return out;
}

export function buildSearchPayload(searchModal, formData, items, extras = {}) {
    const { fromDate: _fd, toDate: _td, ...rest } = searchModal || {};
    return {
        ...rest,
        ...normalizeFormData(formData, items),
        ...extras
    };
}

/** Enter key in filter inputs triggers search */
export function submitOnEnter(handler) {
    return (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handler();
        }
    };
}
