const kuroshiro_src =
  "https://my-html-sites.pages.dev/components/jp-analyst/kuroshiro.min.js";
const kuroshiro_analyze_src =
  "https://my-html-sites.pages.dev/components/jp-analyst/kuroshiro-analyzer-kuromoji.min.js";
const japaneseVerbForms = {
  辞書形: {
    info: "动词的原形，通常用于辞典中。",
    example: "食べる（たべる，taberu，'吃'）",
  },
  未然形: {
    info: "表示未发生的状态，通常用于构成否定形、意志形等。",
    example: "食べ（たべ，tabe）",
  },
  連用形: {
    info: "用于连接其他动词或助动词。",
    example: "食べ（たべ，tabe）",
  },
  終止形: {
    info: "句子的结束形，通常用于表述。",
    example: "食べる（たべる，taberu）",
  },
  連体形: {
    info: "用于修饰名词。",
    example: "食べる（たべる，taberu）",
  },
  仮定形: {
    info: "表示条件。",
    example: "食べれば（たべれば，tabereba）",
  },
  命令形: {
    info: "表示命令或请求。",
    example: "食べろ（たべろ，tabero）",
  },
  意志形: {
    info: "表示意图或愿望。",
    example: "食べよう（たべよう，tabeyou）",
  },
  可能形: {
    info: "表示能力或可能性。",
    example: "食べられる（たべられる，taberareru）",
  },
  使役形: {
    info: "表示使役或让某人做某事。",
    example: "食べさせる（たべさせる，tabesaseru）",
  },
  受身形: {
    info: "表示被动。",
    example: "食べられる（たべられる，taberareru）",
  },
  否定形: {
    info: "表示否定。",
    example: "食べない（たべない，tabenai）",
  },
  過去形: {
    info: "表示过去发生的动作。",
    example: "食べた（たべた，tabeta）",
  },
  現在進行形: {
    info: "表示正在进行的动作。",
    example: "食べている（たべている，tabete iru）",
  },
  完了形: {
    info: "表示动作的完成。",
    example: "食べてしまった（たべてしまった，tabete shimatta）",
  },
};

const jp_styles = `

        .panel {
            background-color: #000;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 5px 10px;
            width: 100%;
            height:100%;
            color: #2ce01c;
        }
        .particle-1, .particle-2, .particle-3, .aux, .verb {
            color: #ffffff; /* 字体颜色为白色 */
            margin: 0 4px; /* 边距 */
            padding: 2px 4px; /* 内边距 */
            border-radius: 4px; /* 圆角 */
            font-weight: bold; /* 加粗 */
            font-size: 1em; /* 字体大小 */
        }
        rt{
          font-size: 12px;
          color: #aaa;
          padding-bottom: 1px;
        }
        .particle-1 rt, .particle-2 rt, .particle-3 rt, .aux rt, .verb rt {
            font-weight: normal;
        }

        .particle-1 {
            background-color: #585858; /* 格助詞 */
        }

        .particle-2 {
            background-color: #7C3200; /* 係助詞 */
        }

        .particle-3 {
            background-color: #00426D; /* 接続助詞 */
        }

        .aux {
            background-color: #005200; /* 助動詞 */
        }

        .verb {
            background-color: #4F0035; /* 動詞 */
        }
        ul {
            list-style-type: none;
            padding: 0;
        }

        li {
            border-radius: 4px; /* 圆角 */
            padding: 10px 15px; /* 内边距 */
            margin: 10px 0; /* 列表项之间的间距 */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
            transition: background-color 0.3s; /* 背景颜色过渡效果 */
        }

        li:hover {
            background-color: #393737; /* 悬停时的背景颜色 */
        }
        #sentence{
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }
  `;

const html = `
      <div id="sentence"></div>
      <ul id="detail"></ul>
  `;

const wordType = {
  格助詞: "particle-1",
  係助詞: "particle-2",
  接続助詞: "particle-3",
  助動詞: "aux",
  動詞: "verb",
};
function annotation(r, hiragna = null) {
  const _t = wordType[r.pos] || wordType[r.pos_detail_1] || "";
  if (hiragna)
    return `<ruby class="${_t}">${r.surface_form}<rp>(</rp><rt>${hiragna}</rt><rp>)</rp></ruby>`;
  else return `<ruby class="${_t}">${r.surface_form}</ruby>`;
}

function getWordDetail(r) {
  if (r.pos == "記号") return "";
  const _t = wordType[r.pos] || wordType[r.pos_detail_1] || "";
  if (r.pos == "動詞") {
    return `<span class="${_t}">${r.basic_form} ➡️ ${r.surface_form} </span><span style="font-style: italic;">${r.conjugated_form} - ${r.conjugated_type} </span>`;
  }
  return "";
}

export default class JPAnalyzer extends HTMLElement {
  static get observedAttributes() {
    return ["sentence", "words", "styles", "script-src"];
  }

  constructor() {
    super();
    this.kuroshiro = {};
    this.dictPath = "";

    // 创建一个 Shadow DOM
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = jp_styles;

    const panel = document.createElement("div");
    panel.classList.add("panel");
    panel.innerHTML = html;
    // 将样式和按钮添加到 Shadow DOM
    shadow.appendChild(style);
    shadow.appendChild(panel);
  }
  //元素被添加到文档的 DOM 中时的生命周期connectedCallback
  connectedCallback() {
    if (this.util && this.analyzer) return;
    const dictPath = this.getAttribute("dictPath");
    if (dictPath) {
      this.dictPath = dictPath;
      //load scripts
      let scripts = [kuroshiro_src, kuroshiro_analyze_src].filter(
        (src) => !this.shadowRoot.querySelector[`script[src="${src}"]`],
      );

      const script_loads = scripts.map((src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(src); // 加载成功
          script.onerror = () =>
            reject(new Error(`Failed to load script: ${src}`)); // 加载失败
          this.shadowRoot.appendChild(script);
        });
      });

      Promise.all(script_loads).then(async () => {
        const k = this.shadowRoot.Kuroshiro || Kuroshiro;
        this.util = k.default.Util;
        this.analyzer = new k.default();
        this.loadDict(dictPath);
      });
    }
  }
  // 指定要观察的属性
  static get observedAttributes() {
    return ["data-text"];
  }

  // 处理属性变化
  async attributeChangedCallback(name, oldValue, newValue) {
    if (!newValue) return;
    if (name === "data-text") {
      if (!this.analyzer || !this.dictPath) {
        // this.loadDict();
        console.warn("字典还未加载完成");
        return;
      }
      const result = await this.analyzer?.parse(newValue);
      // const result2 = await this.analyzer.convert(newValue);
      const _format = this.format(result);
      this.shadowRoot.querySelector("#sentence").innerHTML = _format.data;
      this.shadowRoot.querySelector("#detail").innerHTML = _format.details
        .filter((d) => d && d.length > 2)
        .map((d) => `<li>${d}</li>`)
        .join("");
    } else if (name === "words") {
      console.log("Callback attribute changed from", oldValue, "to", newValue);
    } else if (name === "styles") {
      console.log("Callback attribute changed from", oldValue, "to", newValue);
    }
  }

  // 动态加载外部脚本
  async loadDict(dictPath) {
    const ka = this.KuromojiAnalyzer || KuromojiAnalyzer;
    await this.analyzer
      .init(
        new ka({
          dictPath: dictPath || this.dictPath,
        }),
      )
      .then((r) => console.log("KuromojiAnalyzer 字典加载完成！"))
      .catch((err) => console.log(err));

    if (!this.analyzer?.parse)
      this.analyzer["parse"] = (option) =>
        this.analyzer?._analyzer?.parse(option);
  }

  // 自定义方法
  changeButtonText(newText) {
    // this.button.textContent = newText;
  }

  format(parse_results) {
    if (!parse_results) return;
    let details = [],
      data = "";
    data = parse_results
      .filter((r) => r.pos_detail_1 !== "空白")
      .map((r) => {
        const _base = r.surface_form;
        const _form = r.pos;
        const _detail = getWordDetail(r);
        _detail && details.push(_detail);
        if (this.util.isKatakana(_base)) {
          //片假名 -》 英语
          return annotation(r, this.util.kanaToRomaji(r.surface_form));
        } else if (this.util.isKanji(_base)) {
          //汉字 -》 平假名
          return annotation(r, this.util.kanaToHiragna(r.reading));
        } else {
          return annotation(r);
        }
      })
      .join("");
    return { data, details };
  }
}
