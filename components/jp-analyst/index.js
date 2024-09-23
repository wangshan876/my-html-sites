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
        * {
            box-sizing: border-box;
        }
        .panel {
            background-color: #000;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 5px 10px;
            width: 100%;
            height:100%;
            color: #2ce01c;
            border: 6px solid #0404049e;
            box-sizing: border-box;
        }
        .particle-1, .particle-2, .particle-3, .aux, .verb {
            color: #ffffff; /* 字体颜色为白色 */
            margin: 0 1px;
            padding: 1px 2px;
            border-radius: 2px;
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
        .grammar{
            background-color: #103244; 
        }
        .verb-orig{
          border: 2px solid #717171;
          box-sizing: border-box;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }

        li {
            border-radius: 4px; /* 圆角 */
            padding: 3px 2px;
            font-style: italic;
            color: #eee;
            font-size: 13px;
            transition: background-color 0.3s; /* 背景颜色过渡效果 */
        }

        li:hover {
            background-color: #393737; /* 悬停时的背景颜色 */
        }
        #sentence{
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
          text-wrap: balance;
        }
  `;

const html = `
      <div id="sentence"></div>
      <ul id="detail">字典加载中……</ul>
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
      const detailRoot = this.shadowRoot.querySelector("#detail")
      detailRoot.innerHTML = ""
      const verb_details = _format.details?.verbConjugations
      const grammar_details = _format.details?.grammarPatterns
      if (verb_details) {
        detailRoot.innerHTML += verb_details
          .map((r) => {
            return `<li><span class="verb verb-orig">${r.verb}</span>➡️<span class="verb">${r.surf}</span> <span style="font-style: italic;">${r.form} - ${r.conjugatedType} </span></li>`
          })
          .join("");
      }
      if (grammar_details) {
        detailRoot.innerHTML += grammar_details
          .map((r) => {
            const _h = r.base == r.pattern
              ? `<span class="grammar">${r.base}</span>`
              : `<span class="grammar">${r.base}</span>➡️<span class="grammar">${r.pattern}</span>`
            return `<li>${_h} - ${r.meaning}</li>`
          })
          .join("");
      }
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
      .then((r) => {
        this.shadowRoot.querySelector("#detail").innerHTML = "字典加载完成!";
      })
      .catch((err) => console.log(err));

    if (!this.analyzer?.parse)
      this.analyzer["parse"] = (option) =>
        this.analyzer?._analyzer?.parse(option);
  }

  // 自定义方法
  changeButtonText(newText) {
    // this.button.textContent = newText;
  }
  summarizeKnowledgePoints(data) {
    const summary = {
      partsOfSpeech: {},
      particleFunctions: [],
      verbConjugations: [],
      adjectiveConjugations: [],
      auxiliaryVerbs: [],
      sentenceStructure: [],
      punctuation: [],
      negations: [],
      grammarPatterns: [] // 用于存储辞书形 + 助词的语法结构
    };

    // 定义辞书形 + 助词的组合及其含义
    const grammarCombinations = {
      "base": [ //基本形
        { particle: "か", meaning: "是否做某事" },
        { particle: "られる", meaning: "被动或可能" },
        { particle: "てみる", meaning: "尝试做某事" },
        { particle: "ために", meaning: "为了做某事" },
        { particle: "こと", meaning: "做某事的意思" },
        { particle: "ため", meaning: "为了做某事" },
        { particle: "べき", meaning: "应该做某事" },
        { particle: "よう", meaning: "打算做某事或想要做某事" },
        { particle: "つもり", meaning: "打算做某事" },
        { particle: "の", meaning: "名词化" },
        { particle: "と", meaning: "引用" },
        { particle: "に", meaning: "方向/位置" }
      ],
      "mizen": [ //未然形
        { particle: "ない", meaning: "否定" },
        { particle: "う", meaning: "意志形" },
        { particle: "よう", meaning: "意志形" },
        { particle: "せる", meaning: "使役" },
        { particle: "させる", meaning: "使役" },
        { particle: "れる", meaning: "使役" },
        { particle: "られる", meaning: "使役" },
        { particle: "まい", meaning: "意愿否定" },
        { particle: "ぬ", meaning: "否定" }
      ],
      renyou: [ //連用形
        { particle: "て", meaning: "连用形" },
        { particle: "で", meaning: "连用形" },
        { particle: "たり", meaning: "连用形" },
        { particle: "た", meaning: "连用形" },
        { particle: "つつ", meaning: "持续" },
        { particle: "ながら", meaning: "同时" }
      ],
      shuushi: [ //終止形
        { particle: "た", meaning: "终止形" },
      ],
      katai: [ //仮定形
        { particle: "ば", meaning: "假定形" },
      ]
    };

    data.forEach(item => {
      // 统计词性
      const pos = item.pos;
      if (!summary.partsOfSpeech[pos]) {
        summary.partsOfSpeech[pos] = [];
      }
      summary.partsOfSpeech[pos].push(item.surface_form);

      // 统计助词功能
      if (pos === "助詞") {
        summary.particleFunctions.push({
          particle: item.surface_form,
          type: item.pos_detail_1
        });
      }

      // 统计动词的形态变化
      if (pos === "動詞") {
        if (item.conjugated_form !== "基本形") {
          summary.verbConjugations.push({
            surf: item.surface_form,
            verb: item.basic_form,
            form: item.conjugated_form,
            conjugatedType: item.conjugated_type
          });
        }
        const nextItem = data[data.indexOf(item) + 1];

        if (nextItem && (nextItem.pos === "助動詞" || nextItem.pos === "助詞")) {
          const _verb_form = item.conjugated_form;
          let pattern = item.surface_form + nextItem.surface_form;
          let base = item.surface_form + nextItem.basic_form;
          console.log(item)
          switch (_verb_form) {
            case "基本形":
              const combination = grammarCombinations.base.find(comb => comb.particle === nextItem.surface_form);
              if (combination) {
                summary.grammarPatterns.push({ pattern, base, meaning: combination.meaning });
              }
              break;
            case "未然形":
            case "未然ウ接続":
              const mizenCombination = grammarCombinations.mizen.find(comb => comb.particle === nextItem.basic_form);

              console.log(mizenCombination)
              if (mizenCombination) {
                summary.grammarPatterns.push({ pattern, base, meaning: mizenCombination.meaning });
              }
              break;
            case "連用形":
            case "連用タ接続":
              const renyouCombination = grammarCombinations.renyou.find(comb => comb.particle === nextItem.basic_form);
              if (renyouCombination) {
                summary.grammarPatterns.push({ pattern, base, meaning: renyouCombination.meaning });
              }
              break;
            case "終止形":
            case "終止タ接続":
              const shuushiCombination = grammarCombinations.shuushi.find(comb => comb.particle === nextItem.basic_form);
              if (shuushiCombination) {
                summary.grammarPatterns.push({ pattern, base, meaning: shuushiCombination.meaning });
              }
              break;
            case "仮定形":
            case "仮定タ接続":
              const kataiCombination = grammarCombinations.katai.find(comb => comb.particle === nextItem.basic_form);
              if (kataiCombination) {
                summary.grammarPatterns.push({ pattern, base, meaning: kataiCombination.meaning });
              }
              break;
            default:
              break;
          }
        }
      }

      // 统计形容词的形态变化
      if (pos === "形容詞") {
        summary.adjectiveConjugations.push({
          adjective: item.basic_form,
          form: item.conjugated_form,
          conjugatedType: item.conjugated_type
        });
      }

      // 统计助动词
      if (pos === "助動詞") {
        summary.auxiliaryVerbs.push({
          auxiliary: item.surface_form,
          basicForm: item.basic_form,
          conjugatedType: item.conjugated_type
        });
      }

      // 统计否定形式
      if (pos === "助動詞" && item.basic_form === "ない") {
        summary.negations.push(item.surface_form);
      }

      // // 检查动词与助动词的结合
      // if (pos === "助動詞" && item.basic_form === "ない") {
      //   const previousItem = data[data.indexOf(item) - 1];
      //   if (previousItem && previousItem.pos === "動詞") {
      //     summary.verbConjugations.push({
      //       surf: previousItem.surface_form + item.surface_form,
      //       verb: previousItem.surface_form + previousItem.basic_form,
      //       form: previousItem.conjugated_form + "ない",
      //       conjugatedType: "否定"
      //     });
      //   }
      // }

      // 检查形容词与助动词的结合
      if (pos === "助動詞" && item.basic_form === "です") {
        const previousItem = data[data.indexOf(item) - 1];
        if (previousItem && previousItem.pos === "形容詞") {
          summary.adjectiveConjugations.push({
            adjective: previousItem.basic_form,
            form: previousItem.conjugated_form + "です",
            conjugatedType: "礼貌形"
          });
        }
      }

      // 统计标点符号
      if (pos === "記号") {
        summary.punctuation.push(item.surface_form);
      }
    });

    return summary;
  }


  format(parse_results) {
    console.log(parse_results);
    if (!parse_results) return;
    const knowledgeSummary = this.summarizeKnowledgePoints(parse_results);
    console.log(knowledgeSummary);
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
    return { data, details: knowledgeSummary };
  }
}
