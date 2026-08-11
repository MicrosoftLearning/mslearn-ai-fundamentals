---
title: Get started with AI apps and agents in Azure
permalink: index.html
layout: home
---
These hands-on exercises are designed to complement training content on [Microsoft AI Skills Navigator](https://aiskillsnavigator.microsoft.com/explore/search/learningpath-c1207ab7fef2e855e1cebac091002b0b82d99a80c0b10d9bc1b34cdf25be7c5f).

> ![Image of Anton.](./Instructions/Exercises/media/anton-icon.png)<br/>**Hi, I'm Anton.** Your guide to learning about AI.<br/>To complete these exercises, you'll need a Microsoft Azure subscription. You can sign up for a free trial at [https://azure.microsoft.com](https://azure.microsoft.com).<br/>Alternative exercises that explore AI concepts using an AI model that runs locally in your browser, without requiring an Azure subscription, are available in the [Introduction to AI Concepts](https://microsoftlearning.github.io/mslearn-ai-concepts/) site.

<hr>

{% assign labs = site.pages | where_exp:"page", "page.url contains '/Instructions/Exercises'" %}
{% for activity in labs  %}
{% if activity.lab.islab == true %}
{% if activity.lab.title %}

### [{{ activity.lab.title }}]({{ site.github.url }}{{ activity.url }})

{% if activity.lab.level %}**Level**: {{activity.lab.level}} \| {% endif %}{% if activity.lab.duration %}**Duration**: {{activity.lab.duration}}{% endif %}

{% if activity.lab.description %}
*{{activity.lab.description}}*
{% endif %}
<hr>
{% endif %}
{% endif %}
{% endfor %}
