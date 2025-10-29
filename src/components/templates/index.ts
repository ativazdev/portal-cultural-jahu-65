// Templates principais
export { default as ListTemplate } from './ListTemplate';
export { default as ModalTemplate } from './ModalTemplate';
export { default as DataDisplayTemplate } from './DataDisplayTemplate';

// Componentes especializados do ModalTemplate
export { ConfirmationModal, DetailsModal } from './ModalTemplate';

// Componentes especializados do DataDisplayTemplate
export { ProjectDataDisplay } from './DataDisplayTemplate';

// Tipos
export type {
  ListColumn,
  ListFilter,
  ListAction,
  StatusCard,
  ListTemplateProps
} from './ListTemplate';

export type {
  ModalField,
  ModalTab,
  ModalAction,
  ModalTemplateProps,
  ConfirmationModalProps,
  DetailsModalProps
} from './ModalTemplate';

export type {
  DataField,
  DataSection,
  MetricCard,
  DataDisplayTemplateProps,
  ProjectDataDisplayProps
} from './DataDisplayTemplate';
