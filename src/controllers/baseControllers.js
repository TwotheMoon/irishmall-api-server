import axios from "axios";

// 루트 컨트롤러
export const rootController = (req, res) => {
  res.redirect(301, "https://moondashboard.netlify.app/");
};

// 헬스체크 컨트롤러
export const healthCkController = async (req, res) => {
  const date = new Date();
  const status = true;
  const data = {
    date,
    status
  }
  res.json(data);
};

// NAS 로그 컨트롤러
export const getNasLogController = async (req, res) => {
  try {
    const logs = await axios.get("http://125.133.33.2:3033/api/datasources/proxy/1/query", {
      headers: {
      Cookie: "grafana_session=921f84a85dda28b8393efe668d008f11",
    },
    params: {
      db: "telegraf",
      q: `
        SELECT "severity_code", "message" 
        FROM "syslog" 
        WHERE (
          "hostname" =~ /^(192\\.168\\.50\\.103|alhazmy13-telegraf-influxdb-grafana-1)$/ 
          AND "appname" =~ /^(Connection|System|WinFileService)$/ 
          AND "severity" =~ /^(info|warning)$/ 
          AND "message" =~ //
        ) 
        AND time >= now() - 7d 
        AND time <= now() 
        GROUP BY "hostname", "appname"
      `.trim(),
      epoch: "ms",
      },
    }); 

    res.json(logs.data.results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};