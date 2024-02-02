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
    },
    {
      "type": 5,
      "name": "useen",
      "description": "EasyNegativeを使用します。",
    },
    {
      "type": 3,
      "name": "models",
      "description": "生成に使用するモデルを選択します。",
      choices: [
        { "name": "Anything v5",         "value": config.m_anyv5 },
        { "name": "AnyPastel",           "value": config.m_anyp },
        { "name": "BlueArchive ArtStyle", "value": config.m_barc },
        { "name": "Hassaku v1.3",        "value": config.m_has },
        { "name": "Sudachi v1.0",        "value": config.m_sud }
      ]
    },
    {
      "type": 3,
      "name": "resolution",
      "description": "生成する画像の解像度を選択します。",
      "choices": [
        { "name": "Standard (512x512)", "value": "512x512" },
        { "name": "Portrait (512x768)", "value": "512x768" },
        { "name": "Landscape (768x512)", "value": "768x512" },
        // { "name": "HD Standard (1024x1024)", "value": "1024x1024"},
        // { "name": "HD Portrait (1024x1536)", "value": "1024x1536" },
        // { "name": "HD Landscape (1536x1024)", "value": "1536x1024" }
      ]
    },
    {
      "type": 3,
      "name": "sampler",
      "description": "生成に使用するサンプラーを選択します。",
      "choices": [
        { "name": "Euler a",          "value": "Euler a"          }, // k_euler_a
        { "name": "Euler",            "value": "Euler"            }, // k_euler
        { "name": "DPM++ 2M Karras",  "value": "DPM++ 2M Karras"  }, // k_dpmpp_2m_ka
        { "name": "DPM++ SDE Karras", "value": "DPM++ SDE Karras" }  // k_dpmpp_sde_ka
      ]
    },
    {
      "type": 4,
      "name": "seed",
      "description": "生成に使用するシードを入力します。",
    },
    {
      "type": 4,
      "name": "steps",
      "description": "生成に使用するステップ数を入力します。",
    },
    {
      "type": 4,
      "name": "cfgscale",
      "description": "生成に使用するCFG Scaleを入力します。",
    },
    {
      "type": 5,
      "name": "not_sus",
      "description": "Sussyな画像 ではない ならTrueにしてください。",
    }
  ]
  },

  async execute(interaction) {

    const Negative = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry";
    // Negative Prompt
    if(interaction.options.getString("negative_prompt") === null) {
      NegativePrompt = Negative;
    } else {
      NegativePrompt = `${Negative}` + `, ${interaction.options.getString("negative_prompt")}`;
    }

    // EasyNegative
    if(interaction.options.getBoolean("useen") == true || interaction.options.getBoolean("useen") == null){
      NegativePrompt = NegativePrompt + ", <lora:EasyNegativeV2:1>"
    } else {
      ;
    }

    // Model
    if(interaction.options.getString("models") == null) {
      Model = config.m_anyv5;
    } else {
      Model = interaction.options.getString("models");
    }

    // Resolution
    if(interaction.options.getString("resolution") == null) {
      res_width = "512";
      res_height = "512";
    } else {
      res = interaction.options.getString("resolution");
      resparse = res.split("x");
      res_width = resparse[0];
      res_height = resparse[1];
    }

    // Sampler
    if(interaction.options.getString("sampler") == null) {
      sampler = "DPM++ 2M Karras";
    } else {
      sampler = interaction.options.getString("sampler");
    };

    // Seed
    if(interaction.options.getInteger("seed") == null) {
      Seed = -1;
    } else {
      Seed = interaction.options.getInteger("seed");
    }

    // Steps
    if(interaction.options.getInteger("steps") == null) {
      Steps = 20;
    } else {
      Steps = interaction.options.getInteger("steps");
    }

    // CFG Scale
    if(interaction.options.getInteger("cfgscale") == null) {
      CFGScale = 8;
    } else {
      CFGScale = interaction.options.getInteger("cfgscale");
    }

    await interaction.reply("生成開始！");

    // await interaction.reply("生成開始！\n```" + 
    // "Positive Prompt: masterpiece, best quality, "+ interaction.options.getString("prompt") + "\n" + 
    // "Negative Prompt: " + NegativePrompt + "\n" +
    // "Model: " + Model + "\n" +
    // "Seed: " + Seed + "\n" +
    // "Steps: " + Steps + "\n" +
    // "Sampler: " + sampler + "\n" +
    // "CFG Scale: " + CFGScale + "\n" +
    // "Resolution: " + interaction.options.getString("resolution") + "\n" +
    // "```");

    webclient.post({
      url: "http://127.0.0.1:7861/sdapi/v1/txt2img",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "prompt": "masterpiece, best quality, "+ interaction.options.getString('prompt'),
        "negative_prompt": NegativePrompt,
        "steps": Steps,
        "seed": Seed,
        "sampler_name": sampler,
        "width": res_width,
        "height": res_height,
        "eta": 31337,
        "cfg_scale": CFGScale,
        "save_images": true,
        "override_settings": {
          "sd_model_checkpoint": interaction.options.getString("models"),
          "CLIP_stop_at_last_layers": 2
        },
      })
    },function (error, response, body){

      try {
      const json = body;
      const obj = JSON.parse(json);
      const base64image = obj.images[0];
      const decodedimage = Buffer.from(base64image, "base64");

      if(interaction.options.getBoolean("not_sus") == true) {
        outFilename = "out.png"; } else {
        outFilename = "SPOILER_out.png"; 
      }

      fs.writeFile(outFilename, decodedimage, function(err) {
        if (err) {
          console.error(err);
          interaction.editReply({ content:"https://c.tenor.com/iS8_wMys4GwAAAAC/tenor.gif\n```" + err + "```" });
        } else {
          interaction.editReply({ content: "生成完了！", files: [outFilename] });
          // interaction.editReply({ content: "生成完了！\n```" + 
          // "Positive Prompt: masterpiece, best quality, "+ interaction.options.getString("prompt") + "\n" + 
          // "Negative Prompt: " + NegativePrompt + "\n" +
          // "Model: " + interaction.options.getString("models") + "\n" +
          // "Seed: " + Seed + "\n" +
          // "Steps: " + Steps + "\n" +
          // "Sampler: " + sampler + "\n" +
          // "CFG Scale: " + CFGScale + "\n" +
          // "Resolution: " + interaction.options.getString("resolution") + "\n" +
          // "```", files: ['SPOILER_out.png']});
        }
      }); } catch (error) {
        console.error(error);
        interaction.editReply({ content:"https://c.tenor.com/iS8_wMys4GwAAAAC/tenor.gif" });
      }
      
    });
  }
}