import {
  Card,
  CardContent as CardBody,
} from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";

const ColumnLoading = () => (
  <Card>
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
);

export default ColumnLoading;
