import { useTranslation } from "react-i18next";import { Image } from "./image";
import React from "react";

export const Gallery = (props) => {const { t } = useTranslation();
  return (
    <div id="portfolio" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>{t("Gallery")}</h2>
          <p>
            {t("lorem_ipsum_dolor_sit_amet_9929")}
          
          </p>
        </div>
        <div className="row">
          <div className="portfolio-items">
            {props.data ?
            props.data.map((d, i) =>
            <div
              key={`${d.title}-${i}`}
              className="col-sm-6 col-md-4 col-lg-4">
              
                    <Image
                title={t(d.title)}
                largeImage={d.largeImage}
                smallImage={d.smallImage} />
              
                  </div>
            ) :
            "Loading..."}
          </div>
        </div>
      </div>
      <li className="menu"></li>
    </div>);

};