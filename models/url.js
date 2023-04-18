const mongoose = require('mongoose');
const dns = require('node:dns');

const urlSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      validate: {
        validator: urlValidator,
        message: 'invalid url',
      },
      unique: true,
    },
    short_url: {
      type: Number,
    },
  },
  {
    methods: {
      saveUrl,
    },
  }
);

function urlValidator(v) {
  const urlPattern = /^(https?:\/\/)(.*)$/;
  return new Promise((resolve, reject) => {
    if (!v.match(urlPattern)) {
      resolve(false);
    }
    dns.lookup(v.match(urlPattern)[2], (err) => {
      if (err || !v.match()) {
        resolve(false);
      }
      resolve(true);
    });
  });
}

async function saveUrl() {
  const Url = this.constructor;
  const urlObj = await Url.findOne({ url: this.url });
  if (urlObj) {
    return urlObj;
  }
  return this.save();
}

urlSchema.statics.findLatestShortUrl = async function () {
  const latestUrl = await this.findOne(
    {},
    { short_url: 1 },
    {
      sort: {
        short_url: -1,
      },
    }
  );
  return latestUrl ? latestUrl['short_url'] : 0;
};

urlSchema.pre('save', async function (next) {
  const Url = this.constructor;
  this.short_url = (await Url.findLatestShortUrl()) + 1;
  next();
});

module.exports = mongoose.model('Url', urlSchema);