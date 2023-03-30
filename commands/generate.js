const webclient = require("request");
const fs = require("fs");
const config = require("./../config.json");

module.exports = {
  data: {
    "name": "generate",
    "description": "画像を生成します。",
    "options": [{
      "type": 3,
      "name": "prompt",
      "description": "生成に使用するPromptを入力します。",
      "required": true,
    },
    {
      "type": 3,
      "name": "negative_prompt",
      "description": "生成に使用するNegative Promptを入力します。",
      "required": true,
      "choices": [
        { "name": "AbyssOrangeMix Series (Simple)",   "value": "(worst quality, low quality:1.4), photorealistic, 3d" },
        { "name": "AbyssOrangeMix Series (Expert)",   "value": "aomexp" },
        { "name": "Anything v4.5 / v5 / NovelAI",     "value": "lqba" },
        { "name": "AnyPastel / PastelMix",            "value": "pastel" },
        { "name": "Meina Series",                     "value": "(worst quality, low quality:1.4), monochrome, zombie, extra limbs," }
      ]
    },
    {
      type: 3,
      "name": "models",
      "description": "生成に使用するモデルを選択します。",
      required: true,
      choices: [
        { "name": "Anything v4.5",       "value": config.m_anyv4 },
        { "name": "Anything v5",         "value": config.m_anyv5 },
        { "name": "AnyPastel",           "value": config.m_anyp },
        { "name": "AbyssOrangeMix3",     "value": config.m_aom3 },
        { "name": "AbyssOrangeMix3 A1",  "value": config.m_aom3a1 },
        { "name": "AbyssOrangeMix3 A1B", "value": config.m_aom3a1b },
        { "name": "AbyssOrangeMix3 A2",  "value": config.m_aom3a2 },
        { "name": "AbyssOrangeMix3 A3",  "value": config.m_aom3a3 },
        { "name": "Counterfeit v2.5",    "value": config.m_cf25 },
        { "name": "NovelAI (Full)",      "value": config.m_nai },
        { "name": "NovelAI (Curated)",   "value": config.m_nai_sfw },
        { "name": "MeinaMix v8",         "value": config.m_mmv8 },
        { "name": "MeinaHentai",         "value": config.m_mh   },
        { "name": "PastelMix",           "value": config.m_ppm  }
      ]
    },
    {
      "type": 3,
      "name": "resolution",
      "description": "生成する画像の解像度を選択します。",
      "required": true,
      "choices": [
        { "name": "Standard", "value": "512x512" },
        { "name": "Portrait", "value": "512x768" },
        { "name": "Landscape", "value": "768x512" }
      ]
    },
    {
      "type": 4,
      "name": "seed",
      "description": "生成に使用するシードを入力します。",
    }]
  },

  async execute(interaction) {

    if(interaction.options.getString("negative_prompt") === "lqba") { // Low Quality, Bad Anatomy (NovelAI, Anything Series)
      NegativePrompt = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, ";
    } else if(interaction.options.getString("negative_prompt") === "aomexp") { // AbyssOrangeMix v2
      NegativePrompt = "(worst quality, low quality:1.4), (lip, nose, tooth, rouge, lipstick, eyeshadow:1.4), (blush:1.2), (jpeg artifacts:1.4), (depth of field, bokeh, blurry, film grain, chromatic aberration, lens flare:1.0), (1boy, abs, muscular, rib:1.0), greyscale, monochrome, dusty sunbeams, trembling, motion lines, motion blur, emphasis lines, text, title, logo, signature, ";
    } else if(interaction.options.getString("negative_prompt") === "pastel") { // PastelMix, AnyPastel
      NegativePrompt = "lowres, ((bad anatomy)), ((bad hands)), text, missing finger, extra digits, fewer digits, blurry, ((mutated hands and fingers)), (poorly drawn face), ((mutation)), ((deformed face)), (ugly), ((bad proportions)), ((extra limbs)), extra face, (double head), (extra head), ((extra feet)), monster, logo, cropped, worst quality, low quality, normal quality, jpeg, humpbacked, long body, long neck, ((jpeg artifacts)), "
    } else {
      NegativePrompt = interaction.options.getString("negative_prompt");
    }

    if(interaction.options.getInteger("seed") === null) {
      Seed = -1;
    } else {
      Seed = interaction.options.getInteger("seed");
    }

    const res = interaction.options.getString("resolution");
    const res_width = res.substring(0, 3);
    const res_height = res.substring(4, 7);

    await interaction.reply("生成開始！\n```" + 
    "Positive Prompt: masterpiece, best quality, "+ interaction.options.getString("prompt") + "\n" + 
    "Negative Prompt: " + NegativePrompt + "\n" +
    "Model: " + interaction.options.getString("models") + "\n" +
    "Seed: " + Seed + "\n" +
    "Resolution: " + interaction.options.getString("resolution") + "\n" +
    "```");

    webclient.post({
      url: "http://127.0.0.1:7861/sdapi/v1/txt2img",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "prompt": "masterpiece, best quality, "+ interaction.options.getString('prompt'),
        "negative_prompt": NegativePrompt,
        "steps": 20,
        "seed": Seed,
        "sampler_name": "DPM++ 2M Karras",
        "sampler_index": "DPM++ 2M Karras",
        "width": res_width,
        "height": res_height,
        "eta": 31337,
        "cfg_scale": 8,
        "save_images": true,
        "override_settings": {
          "sd_model_checkpoint": interaction.options.getString("models"),
          "CLIP_stop_at_last_layers": 2
        },
      })
    },function (error, response, body){

      const json = body;
      const obj = JSON.parse(json);
      const base64image = obj.images[0];
      const decodedimage = Buffer.from(base64image, "base64");

      const outFilename = "SPOILER_out.png";
      fs.writeFile(outFilename, decodedimage, function(err) {
        if (err) {
          console.error(err);
          interaction.editReply({ content:"生成に失敗しました...\n```" + err + "```" });
        } else {
          interaction.editReply({ content: "生成完了！\n```" + 
          "Positive Prompt: masterpiece, best quality, "+ interaction.options.getString("prompt") + "\n" + 
          "Negative Prompt: " + NegativePrompt + "\n" +
          "Model: " + interaction.options.getString("models") + "\n" +
          "Resolution: " + interaction.options.getString("resolution") + "\n" +
          "```", files: ['SPOILER_out.png']});
        }
      });
    });
  }
}