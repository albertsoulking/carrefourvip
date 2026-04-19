import React, { useMemo, useState } from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import airportsData from "../../data/airports.json";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

// 虚拟滚动
function ListboxComponent(props) {
  const { children, ...other } = props;
  const itemData = Array.isArray(children) ? children : [];

  return (
    <div {...other}>
      <Virtuoso
        style={{ height: 400 }}
        data={itemData}
        itemContent={(index, child) => child}
      />
    </div>
  );
}

export default function AirportAutocomplete({ label, value, onChange }) {
  const [input, setInput] = useState("");

  // ✅ 原始数据（只处理一次）
  const options = useMemo(() => {
    return Object.values(airportsData || {}).filter(
      (a) => a && a.iata
    );
  }, []);

  // ✅ 自定义搜索（核心）
  const filteredOptions = useMemo(() => {
    const keyword = input.toLowerCase().trim();

    if (!keyword) return options.slice(0, 200); // 🔥 限制初始数量

    return options
      .filter((a) => {
        return (
          a.iata?.toLowerCase().includes(keyword) ||
          a.name?.toLowerCase().includes(keyword) ||
          a.city?.toLowerCase().includes(keyword) ||
          a.country?.toLowerCase().includes(keyword) ||
          a.state?.toLowerCase().includes(keyword)
        );
      })
      .slice(0, 500); // 🔥 限制结果，避免卡
  }, [input, options]);

  return (
    <Autocomplete
      options={filteredOptions}

      ListboxComponent={ListboxComponent}

      // ❗ 关闭默认过滤（非常关键）
      filterOptions={(x) => x}

      getOptionLabel={(option) =>
        option?.iata ? `${option.iata} - ${option.name}` : ""
      }

      isOptionEqualToValue={(option, value) =>
        option?.iata === value?.iata
      }

      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            py: 1,
            px: 1,
          }}
        >
          <FlightTakeoffIcon color="action" />

          <Box>
            <Typography fontWeight={600}>
              {option.name} ({option.iata})
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {option.country} · {option.city}
            </Typography>
          </Box>
        </Box>
      )}

      renderInput={(params) => (
        <TextField {...params} label={label || "Airport"} />
      )}

      value={options.find((a) => a.iata === value) || null}

      onInputChange={(e, val) => setInput(val)}

      onChange={(e, val) => onChange(val?.iata || "")}
    />
  );
}
