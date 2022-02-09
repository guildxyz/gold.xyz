(function(h,o,u,n,d) {
    h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
    d=o.createElement(u);d.async=1;d.src=n
    n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
  })(window,document,'script','/datadog-rum-v4.js','DD_RUM')
  DD_RUM.onReady(function() {
    DD_RUM.init({
      clientToken: 'pub5fb36aafb14ad47e453d0faf0bee3b18',
      applicationId: '56a043b6-a5c4-444b-a276-b39ad8e87e36',
      site: 'datadoghq.eu',
      service:'gold.xyz',
      env:'prod',
      // Specify a version number to identify the deployed version of your application in Datadog 
      // version: '1.0.0',
      sampleRate: 100,
      trackInteractions: true,
      defaultPrivacyLevel: 'mask-user-input'
    });
    
    DD_RUM.startSessionReplayRecording();
  })