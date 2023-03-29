const webclient = require("request");
const fs = require("fs");
const config = require("./../config.json");

module.exports = {
  data: {
    name: "generate",
    description: "画像を生成します。",
    options: [{
      type: 3,
      name: "prompt",
      description: "生成に使用するPromptを入力します。",
      required: true,
    },
    {
      type: 3,
      name: "negative_prompt",
      description: "生成に使用するNegative Promptを入力します。",
      required: true,
      choices: [
        { name: "General", value: "(worst quality, low quality:1.4), photorealistic, 3d" },
        { name: "for Meina Series", value: "(worst quality, low quality:1.4), monochrome, zombie, extra limbs," }
      ]
    },
    {
      type: 3,
      name: "models",
      description: "生成に使用するモデルを選択します。",
      required: true,
      choices: [
        { name: "Anything v4.5",   value: config.m_anyv4 },
        { name: "AnyPastel",       value: config.m_anyp },
        { name: "AbyssOrangeMix3", value: config.m_aom3 },
        { name: "MeinaMix v8",     value: config.m_mmv8 },
        { name: "PastelMix",       value: config.m_ppm  }
      ]
    },
    {
      type: 3,
      name: "resolution",
      description: "生成する画像の解像度を選択します。",
      required: true,
      choices: [
        { name: "Standard", value: "512x512" },
        { name: "Portrait", value: "512x768" },
        { name: "Landscape", value: "768x512" }
      ]
    }]
  },
  async execute(interaction) {
    await interaction.reply("生成開始！\n```" + 
    "Prompt: masterpiece, best quality, "+ interaction.options.getString("prompt") + "\n" + 
    "Negative: " + interaction.options.getString("negative_prompt") + "\n" +
    "Model: " + interaction.options.getString("models") + "\n" +
    "Resolution: " + interaction.options.getString("resolution") + "\n" +
    "```");

    const res = interaction.options.getString("resolution");
    const res_width = res.substring(0, 3);
    const res_height = res.substring(4, 7);

    webclient.post({
      url: "http://127.0.0.1:7861/sdapi/v1/txt2img",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "prompt": "masterpiece, best quality, "+ interaction.options.getString('prompt'),
        "negative_prompt": interaction.options.getString('negative_prompt'),
        "steps": 20,
        "seed": -1,
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
    }, function (error, response, body){

      const json = body;
      const object = JSON.parse(json);
      const base64str = object.images[0];
  
      fs.promises.writeFile("out.png", base64str, {encoding: "base64"});
      interaction.editReply({ content: "生成完了！\n```" + 
      "Prompt: masterpiece, best quality, "+ interaction.options.getString("prompt") + "\n" + 
      "Negative: " + interaction.options.getString("negative_prompt") + "\n" +
      "Model: " + interaction.options.getString("models") + "\n" +
      "Resolution: " + interaction.options.getString("resolution") + "\n" +
      "```", files: ['out.png']});
    });
  }
}