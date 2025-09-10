# 🚗 Quick Park

Quick Park 是一个基于浏览器定位的极简 Web 应用。页面只有一个圆形“🅿️”按钮：点击后自动定位、搜索最近的“免费停车场（fee != yes）”，并直接唤起 Google Maps 导航到该停车点。

## ✅ 特性

- 单一圆形按钮：点击后直接打开 Google Maps 导航
- 自动过滤付费停车场（只显示 `fee != yes`）
- 纯前端静态页面，无地图渲染、无后端依赖

## 🛠 技术栈

- `Leaflet`：地图展示
- `OpenStreetMap`：地图底图
- `Overpass API`：周边地点检索
- `Vercel`：静态部署

## 📂 项目结构

```
quick-park/
│── index.html      # 页面入口（只含一个按钮）
│── style.css       # 样式文件（按钮居中）
│── script.js       # 定位、查询、跳转逻辑
│── README.md       # 项目文档
```

## 🚀 本地运行

1) 克隆项目（或直接下载）

```
git clone https://github.com/yourname/quick-park.git
cd quick-park
```

2) 直接用浏览器打开 `index.html` 即可运行（需要允许定位权限）。

推荐本地服务器方式（避免部分浏览器的本地文件限制）：

```
npx serve .
```

## 🌍 部署到 Vercel

推送代码到 GitHub：

```
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/yourname/quick-park.git
git push -u origin main
```

登录 Vercel，选择 New Project：

- 导入仓库 → Framework Preset 选 `Other`
- Root Directory 选项目目录 → 点击 `Deploy`
- 访问生成的 URL，例如：`https://quick-park.vercel.app` 🎉

## 🔍 Overpass API 查询说明

当前查询包括以下标签：

- 免费停车场：`amenity=parking` 且 `fee != yes`
- 快餐店/餐厅：`amenity=fast_food | restaurant`
- 超市：`amenity=supermarket`
- 购物中心：`shop=mall`

示例查询（JavaScript 中以 POST 方式发送到 `https://overpass-api.de/api/interpreter`）：

```
[out:json];
(
  node(around:1500, LAT, LNG)["amenity"="parking"]["fee"!="yes"];
  way(around:1500, LAT, LNG)["amenity"="parking"]["fee"!="yes"];
);
out center 100;
```

本项目会自动从 800m→1200m→1600m→2000m 逐步扩大搜索范围，直到找到最近的免费停车场并立即打开 Google Maps 导航。

## ❗ 注意事项

- 首次加载需允许浏览器定位权限，否则无法获取当前位置。
- Overpass API 有速率及配额限制，若请求失败可稍后再试或自行更换镜像。
- OSM 社区数据为众包数据，可能存在缺失或不准确情况，欢迎参与改进。

## ✅ TODO / 可选增强

- 按类型开关筛选（停车场/餐饮/超市/商场）
- 为不同类型使用彩色自定义图标
- 支持自动重试或多 Overpass 实例切换
- 显示距离、步行时间等信息
