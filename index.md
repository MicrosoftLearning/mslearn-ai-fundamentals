---
title: Get started with AI apps and agents in Azure
permalink: index.html
layout: home
---
These hands-on exercises are designed to support training content on [Microsoft Learn](https://learn.microsoft.com/training/paths/get-started-ai-apps-agents/).

To complete these exercises, you'll need a Microsoft Azure subscription. You can sign up for a free trial at [https://azure.microsoft.com](https://azure.microsoft.com).

{% assign labs = site.pages | where_exp:"page", "page.url contains '/Instructions/Exercises'" %}
{% for activity in labs  %}
{% if activity.lab.title %}
<hr>
### [{{ activity.lab.title }}]({{ site.github.url }}{{ activity.url }})
{% endif %}

{% if activity.lab.level %}Level: {{activity.lab.level}}{% endif %}

{% if activity.lab.duration %}Duration: {{activity.lab.duration}}{% endif %}

{% if activity.lab.description %}
{{activity.lab.description}}
{% endif %}

{% endfor %}
