import useSWR from "swr";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, Row, Col } from "react-bootstrap";
import ArtworkCard from "@/components/ArtworkCard";
import { Pagination } from "react-bootstrap";
import Error from "next/error";
import validObjectIDList from "@/public/data/validObjectIDList.json";

const PER_PAGE = 12;

export default function Artwork() {
  const router = useRouter();
  const [artworkList, setArtworkList] = useState();
  const [page, setPage] = useState(1);

  let finalQuery = router.asPath.split("?")[1];

  const { data, error } = useSWR(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?${finalQuery}`
  );

  useEffect(() => {

    const results = [];

    if (data != null && data != undefined) {

      let filteredResults = validObjectIDList.objectIDs.filter((x) =>
        data.objectIDs?.includes(x)
      );


      for (let i = 0; i < filteredResults.length; i += PER_PAGE) {
        const chunk = filteredResults.slice(i, i + PER_PAGE);
        results.push(chunk);
      }

      setArtworkList(results);
      setPage(1);
    }
  }, [data]);

  const previousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const nextPage = () => {
    if (page < artworkList.length) setPage((prevPage) => prevPage + 1);
  };

  if (!artworkList) return null;
  if (error) return <Error statuscode={404} />;

  return (
    <>
      {artworkList.length > 0 ? (
        <Row className="gy-4">
          {artworkList[page - 1].map((currentObjectID) => (
            <Col lg={3} key={currentObjectID}>
              <ArtworkCard objectID={currentObjectID} />
            </Col>
          ))}
        </Row>
      ) : (
        <Col>
          <Card>
            <Card.Body>
              <h4>Nothing Here</h4>
              Try searching for something else.
            </Card.Body>
          </Card>
          <br />
          <br />
        </Col>
      )}

      {artworkList.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Pagination>
              <Pagination.Prev onClick={previousPage} disabled={page === 1} />
              <Pagination.Item>{page}</Pagination.Item>
              <Pagination.Next onClick={nextPage} />
            </Pagination>
          </Col>
        </Row>
      )}
    </>
  );
}
