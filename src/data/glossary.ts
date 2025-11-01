export interface GlossaryEntry {
  term: string;
  termEn: string;
  definition: string;
  example?: string;
}

export const glossaryData: GlossaryEntry[] = [
  {
    term: 'DAO (Data Access Object)',
    termEn: 'Data Access Object',
    definition: '데이터베이스의 데이터에 접근하기 위한 객체입니다. 실제로 DB에 접근하여 데이터를 삽입, 삭제, 조회 등의 작업을 수행합니다.',
    example: 'UserDao.findById(), UserDao.save()'
  },
  {
    term: 'DTO (Data Transfer Object)',
    termEn: 'Data Transfer Object',
    definition: '계층 간 데이터 교환을 위한 객체입니다. 주로 View와 Controller 사이, Controller와 Service 사이에서 데이터를 전송할 때 사용됩니다.',
    example: 'UserRequestDto, UserResponseDto'
  },
  {
    term: 'Entity',
    termEn: 'Entity',
    definition: '실제 데이터베이스 테이블과 매핑되는 객체입니다. DB 테이블의 컬럼과 1:1로 매칭되며 영속성을 가집니다.',
    example: '@Entity class User { @Id private Long id; }'
  },
  {
    term: 'Repository',
    termEn: 'Repository',
    definition: 'Entity에 대한 데이터베이스 작업을 처리하는 인터페이스입니다. Spring Data JPA에서 제공하는 패턴으로 DAO와 유사한 역할을 합니다.',
    example: 'UserRepository extends JpaRepository<User, Long>'
  },
  {
    term: 'Service',
    termEn: 'Service Layer',
    definition: '비즈니스 로직을 처리하는 계층입니다. Controller와 DAO/Repository 사이에서 비즈니스 요구사항을 구현합니다.',
    example: 'UserService.registerUser(UserRequestDto)'
  },
  {
    term: 'Mapper',
    termEn: 'Mapper/Converter',
    definition: 'Entity와 DTO 간의 변환을 담당하는 객체입니다. Entity의 데이터를 DTO로, DTO의 데이터를 Entity로 변환합니다.',
    example: 'UserMapper.toDto(user), UserMapper.toEntity(dto)'
  },
  {
    term: '영속성 컨텍스트',
    termEn: 'Persistence Context',
    definition: 'Entity를 영구 저장하는 환경입니다. JPA의 핵심 개념으로, Entity의 생명주기를 관리하고 1차 캐시 역할을 합니다.',
    example: 'EntityManager를 통해 관리됩니다'
  },
  {
    term: '계층 분리',
    termEn: 'Layer Separation',
    definition: '애플리케이션의 관심사를 여러 계층으로 나누어 관리하는 설계 원칙입니다. 각 계층은 명확한 책임을 가지며 독립적으로 변경 가능합니다.',
    example: 'Presentation → Business → Persistence → Database'
  }
];
