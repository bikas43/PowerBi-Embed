import React, { useEffect, useRef, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import * as pbi from 'powerbi-client';

const MINUTES_BEFORE_EXPIRATION = 10;
const INTERVAL_TIME = 30000;

export default function PowerBiEmbedReport({ reportId, embedUrl, accessToken }) {
  const embedRef = useRef(null);
  let tokenExpiration = null;

  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenAndUpdate();
    }, INTERVAL_TIME);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (embedRef.current && embedRef.current.embed && embedRef.current.iframeRef && embedRef.current.iframeRef.current) {
      embedRef.current.embed.load(embedRef.current.iframeRef.current.contentWindow);
    }
  }, [embedRef.current]);

  async function checkTokenAndUpdate() {
    const currentTime = Date.now();
    const expiration = Date.parse(tokenExpiration);
    const timeUntilExpiration = expiration - currentTime;
    const timeToUpdate = MINUTES_BEFORE_EXPIRATION * 60 * 1000;

    if (timeUntilExpiration <= timeToUpdate) {
      console.log('Updating report access token');
      await updateToken();
    }
  }

  async function updateToken() {
    try {
      const newAccessToken = await getNewAccessToken();
      tokenExpiration = newAccessToken.expiration;

      if (embedRef.current && embedRef.current.embed) {
        await embedRef.current.embed.setAccessToken(newAccessToken.token);
        console.log('Report access token updated');
      }
    } catch (error) {
      console.log('Error updating report access token:', error);
    }
  }

  async function getNewAccessToken() {
    try {
      const response = await fetch('YOUR_BACKEND_API_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary headers for authentication or authorization
        },
        // Include any required request body or parameters
        body: JSON.stringify({
          // Add any necessary data
        }),
      });

      const data = await response.json();
      const newAccessToken = {
        token: data.accessToken,
        expiration: data.expiration,
      };

      return newAccessToken;
    } catch (error) {
      console.log('Error retrieving new access token:', error);
      throw error;
    }
  }

  return (
    <PowerBIEmbed
      embedConfig={{
        type: 'report',
        reportId: reportId,
        embedUrl: embedUrl,
        accessToken: accessToken,
        tokenType: pbi.models.TokenType.embed,
        settings: {
          navContentPaneEnabled: false,
          layoutType: pbi.models.LayoutType.Custom,
          customLayout: {
            displayOption: pbi.models.DisplayOption.FitToPage,
          },
          panes: {
            filters: {
              expanded: true,
              visible: false,
            },
            footer: {
              visible: false,
            },
          },
        },
      }}
      cssClassName="powerbi-report"
      ref={embedRef}
    />
  );
}
