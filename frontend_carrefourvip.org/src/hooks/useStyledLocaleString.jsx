const useStyledLocaleString = (
    price = 0,
    geoInfo
) => {
    const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const parts = formatter.formatToParts(price);

    // 将格式拆分为整数、小数和符号
    const intPart = parts
        .filter((p) => p.type === 'integer' || p.type === 'group')
        .map((p) => p.value)
        .join('');

    const decimalPart = parts.find((p) => p.type === 'decimal')
        ? parts
              .filter((p) => p.type === 'fraction')
              .map((p) => p.value)
              .join('')
        : null;

    const currencySymbol =
        parts.find((p) => p.type === 'currency')?.value || '';
    const prefix =
        parts.findIndex((p) => p.type === 'currency') <
        parts.findIndex((p) => p.type === 'integer');

    return (
        <span>
            {prefix && <>{currencySymbol} </>}
            {intPart}
            {decimalPart && (
                <>
                    <span>
                        {parts.find((p) => p.type === 'decimal')?.value}
                    </span>
                    <span style={{ fontSize: '0.7em' }}>{decimalPart}</span>
                </>
            )}
            {!prefix && <> {currencySymbol}</>}
        </span>
    );
};

export default useStyledLocaleString;
