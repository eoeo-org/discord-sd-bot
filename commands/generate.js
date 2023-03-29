const webclient = require("request");

module.exports = {
  data: {
    name: "generate",
    description: "画像を生成します。",
    options: [{
      type: 3,
      name: "prompt",
      description: "生成に使用するPromptを入力します。",
      required: true,
    }]
  },
  async execute(interaction) {
    await interaction.reply("生成開始！\nPrompt: " + interaction.options.getString("prompt"));
    webclient.post({
      url: "http://127.0.0.1:7861/sdapi/v1/txt2img",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "prompt": interaction.options.getString("prompt"),
        "negative_prompt": "(worst quality, low quality:1.4)",
        "steps": 20,
        "seed": -1,
        "sampler_name": "DPM++ 2M Karras",
        "sampler_index": "DPM++ 2M Karras",
        "width": 512,
        "height": 512,
        "eta": 31337,
        "cfg_scale": 8,
        "save_images": true
      })
    }, function (error, response, body){
      console.log(body);
    })
  }
}