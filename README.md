# hugo-theme-doksam

Hugo 블로그 테마다. 첫 화면에 두 섹션을 나란히 놓는다. 대표 이미지가 붙는 글(예: 증시 요약)과 글 목록 중심의 글(예: 개발)을 한 화면에서 함께 보여 준다.

A two-column Hugo blog theme. The home page puts two sections side by side — one led by a cover image, one a plain post list. Korean-first typography (Pretendard), light and dark, multilingual. No JavaScript framework and no CSS build step.

같은 화면을 Astro 로 만든 테마는 [astro-theme-doksam](https://github.com/LeeYudok/astro-theme-doksam) 이다.

## 들어 있는 것

- 첫 화면 두 칸. 각 칸은 최신 글 하나를 크게, 나머지를 날짜와 제목으로 보여 준다. 글이 없는 칸은 빠진다.
- 섹션 목록, 전체 글, 태그, 글, 검색, 404 화면
- Hugo 다국어. 언어 전환 버튼은 번역 글이 있으면 그 글로, 없으면 그 언어의 첫 화면으로 간다.
- 스크롤해도 화면 위에 붙는 머리말.
- 밝게·어둡게 전환. 처음에는 시스템 설정을 따르고 고른 값은 브라우저에 남는다.
- 코드 색은 밝은 화면(github)과 어두운 화면(github-dark)을 따로 넣었다.
- 아이콘은 [Phosphor Icons](https://github.com/phosphor-icons/core)(MIT)의 SVG 다.

Hugo 0.146.0 이상이 필요하다(새 `layouts/` 구조를 쓴다). 2026-11-17 에 Hugo 0.170.0 으로 예제 사이트를 빌드해 확인했다.

## 설치

```bash
git submodule add https://github.com/LeeYudok/hugo-theme-doksam themes/hugo-theme-doksam
```

`hugo.toml`:

```toml
theme = "hugo-theme-doksam"
defaultContentLanguage = "ko"

[taxonomies]
  tag = "tags"

[markup.highlight]
  noClasses = false   # 테마의 코드 색을 쓴다

[params]
  author = "글쓴이"
  description = "첫 화면 소개 한 줄"
  homeSections = ["market", "dev"]   # 첫 화면에 나란히 놓을 섹션 두 개
  homeCount = 5                      # 한 칸의 글 수

  [[params.socials]]
    label = "GitHub"
    url = "https://github.com/you"
    icon = "github-logo"

[[menus.main]]
  name = "증시"
  pageRef = "/market"
  weight = 1
[[menus.main]]
  name = "개발"
  pageRef = "/dev"
  weight = 2
[[menus.main]]
  name = "전체 글"
  pageRef = "/posts"
  weight = 3
[[menus.main]]
  name = "태그"
  pageRef = "/tags"
  weight = 4
```

예제 사이트로 먼저 볼 수 있다.

```bash
git clone https://github.com/LeeYudok/hugo-theme-doksam
cd hugo-theme-doksam/exampleSite
hugo server --themesDir ../..
```

## 글 쓰기

섹션은 `content/` 아래 폴더다. 폴더 이름이 주소가 되고 `_index.md` 의 `title` 이 화면에 보이는 이름이 된다.

```text
content/
  market/_index.md      title: 증시
  market/2026-11-16.md
  dev/_index.md         title: 개발
  dev/hello.md
  posts/_index.md       title: 전체 글,  layout: all
  search/_index.md      title: 검색,    layout: search
```

```md
---
title: 글 제목
description: 목록과 검색 결과에 보이는 한두 문장
date: 2026-11-16T22:10:00+09:00
tags: [kospi]
cover: covers/2026-11-16.png
---
```

| 항목 | 뜻 |
|---|---|
| `title`, `date` | 제목과 발행 시각 |
| `description` | 목록과 `meta description` 에 쓴다. 없으면 본문 요약을 쓴다 |
| `cover` | 대표 이미지. 첫 화면, 목록, `og:image` 에 쓴다 |
| `tags` | 태그 목록 |
| `canonicalURL` | 원문이 다른 곳에 있을 때 그 주소 |

`cover` 는 세 곳에서 차례로 찾는다. 글 묶음(page bundle) 안의 파일, `assets/` 아래 파일, 그대로 쓰는 주소다. 앞의 두 경우 PNG·JPG 는 폭에 맞춰 줄인다. SVG 는 그대로 쓴다.

## 설정

| `params` | 기본값 | 뜻 |
|---|---|---|
| `description` | 없음 | 첫 화면 소개. 언어별로 다르게 하려면 `languages.<언어>.params.description` |
| `author` | 사이트 제목 | 꼬리말과 `meta author` |
| `homeSections` | `["market", "dev"]` | 첫 화면에 놓을 섹션. 앞의 두 개만 쓴다 |
| `homeCount` | `5` | 첫 화면 한 칸의 글 수 |
| `socials` | 없음 | 꼬리말 링크. `icon` 은 `github-logo`, `rss`, `arrow-up-right` |
| `favicon` | 없음 | 파비콘 경로 |
| `pretendardCDN` | `true` | Pretendard 글꼴을 jsDelivr 에서 받는다. `false` 면 시스템 글꼴을 쓴다 |

메뉴는 Hugo 의 `menus.main` 을 그대로 그린다. 언어별 메뉴는 `languages.<언어>.menus.main` 에 적는다.

## 검색

검색 화면은 [Pagefind](https://pagefind.app/) 가 만든 `/pagefind/` 파일을 읽는다. 빌드 뒤에 색인을 만든다.

```bash
hugo && npx pagefind --site public
```

## 색 바꾸기

사이트의 `assets/css/custom.css` 에 변수를 덮어쓴다. 이 파일이 있으면 테마가 함께 싣는다.

```css
:root {
  --accent: #1d4ed8;
}
:root[data-theme="dark"] {
  --accent: #93b4ff;
}
```

## 머리말 고정

머리말은 스크롤해도 화면 위에 붙어 있다. 글 안 제목으로 가는 링크는 머리말 높이(`--head-h`)만큼 비우고 멈춘다. 고정을 끄려면 사이트의 `assets/css/custom.css` 에 적는다.

```css
.head {
  position: static;
}
:root {
  --head-h: 0rem;
}
```

## 모서리 바꾸기

모서리 반경은 변수 네 개로 정한다. 사이트의 `assets/css/custom.css` 에서 덮어쓴다.

| 변수 | 기본값 | 쓰이는 곳 |
|---|---|---|
| `--radius` | `10px` | 대표 이미지, 코드블록, 이전·다음 상자, 검색창 |
| `--radius-control` | `8px` | 머리말 버튼, 목록의 작은 이미지 |
| `--radius-inline` | `5px` | 글줄 안 코드, 포커스 표시 |
| `--radius-pill` | `999px` | 섹션 표시, 태그 |

```css
:root {
  --radius: 2px;
  --radius-control: 2px;
  --radius-inline: 2px;
  --radius-pill: 2px;
}
```

## 한계

- 목록 화면에 쪽 나눔이 없다.
- 폐쇄망에서는 `pretendardCDN = false` 로 두고 글꼴을 직접 넣어야 한다.
- 화면 글귀는 한국어와 영어만 들어 있다.

## 라이선스

MIT
