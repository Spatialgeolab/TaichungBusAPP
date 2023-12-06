import "./BusRouteFavorites.css";
import BackDrop from "../BackDrop/BackDrop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid, faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
const BusRouteFavorites = ({
  setShowFavorite,
  busFavoriteItem,
  addFavoriteRoute,
  setInputBus,
  clearFavoriteRoute,
}) => {
  return (
    // BD透過react portal渲染其InnerText
    <BackDrop setShowFavorite={setShowFavorite}>
      <div className='favorite-container'>
        <div className='fav-header'>
          <FontAwesomeIcon
            className='close-btn'
            size='xl'
            icon={faChevronCircleLeft}
            onClick={() => {
              setShowFavorite(false);
            }}
          />
          <div>
            <span>我的收藏路線</span>
            <span
              onClick={() => {
                clearFavoriteRoute();
              }}>
              清空路線
            </span>
          </div>
          <hr />
        </div>
        <ul className='favorite-ul'>
          {busFavoriteItem.map((item) => {
            return (
              <li>
                <span>
                  <FontAwesomeIcon
                    icon={faStarSolid}
                    onClick={(e) => {
                      addFavoriteRoute(item.RouteId);
                    }}
                  />
                </span>
                <div
                  onClick={() => {
                    setInputBus(item.RouteId);
                    setShowFavorite(false);
                  }}>
                  <span>{item.RouteId}</span>
                  <span>{item.RouteName}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </BackDrop>
  );
};

export default BusRouteFavorites;
